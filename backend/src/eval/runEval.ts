import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { hybridSearchService } from '../services/hybridSearchService';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface GoldenQuery {
    id: string;
    query: string;
    bucket: string;
    expected: string[];
}

interface QueryResultDetail {
    id: string;
    query: string;
    bucket: string;
    latencyMs: number;
    resultCount: number;
    returnedNames: string[];
    recallAt10: number;
    mrr: number;
    ndcgAt10: number;
    zeroResult: boolean;
}

interface BucketSummary {
    bucket: string;
    queryCount: number;
    avgRecall10: number;
    avgMrr: number;
    avgNdcg10: number;
    zeroResultRate: number;
    avgLatencyMs: number;
}

function calculateDCG(relevances: number[]): number {
    let dcg = 0;
    for (let i = 0; i < relevances.length; i++) {
        const rel = relevances[i];
        if (rel > 0) {
            dcg += (Math.pow(2, rel) - 1) / Math.log2(i + 2);
        }
    }
    return dcg;
}

async function runEvaluation() {
    console.log('--- Starting Amazon-Grade Search Engine Evaluation ---');

    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/smartmarket';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    const queriesPath = path.resolve(__dirname, 'golden_queries.json');
    const goldenQueries: GoldenQuery[] = JSON.parse(fs.readFileSync(queriesPath, 'utf8'));

    const details: QueryResultDetail[] = [];

    for (const q of goldenQueries) {
        const start = performance.now();
        const searchRes = await hybridSearchService.search(q.query);
        const latencyMs = Math.round(performance.now() - start);

        const returned = searchRes.results.slice(0, 10);
        const returnedNames = returned.map(r => r.name);
        const resultCount = returned.length;
        const zeroResult = resultCount === 0;

        let recallAt10 = 0;
        let mrr = 0;
        let ndcgAt10 = 0;

        if (q.bucket === 'out_of_catalog') {
            if (zeroResult || searchRes.isOutOfCatalog) {
                recallAt10 = 1;
                mrr = 1;
                ndcgAt10 = 1;
            } else {
                recallAt10 = 0;
                mrr = 0;
                ndcgAt10 = 0;
            }
        } else {
            // Assess matches
            const relevances: number[] = [];
            let firstRelevantRank = -1;

            returned.forEach((item, index) => {
                const itemText = (item.name + ' ' + (item.category || '') + ' ' + (item.keywords || []).join(' ') + ' ' + (item.similarTo || []).join(' ')).toLowerCase();
                const isRelevant = q.expected.some(exp => itemText.includes(exp.toLowerCase()));

                if (isRelevant) {
                    relevances.push(1);
                    if (firstRelevantRank === -1) {
                        firstRelevantRank = index + 1;
                    }
                } else {
                    relevances.push(0);
                }
            });

            const relevantMatches = relevances.filter(r => r > 0).length;
            recallAt10 = q.expected.length > 0 ? (relevantMatches > 0 ? 1 : 0) : (zeroResult ? 1 : 0);
            mrr = firstRelevantRank > 0 ? 1 / firstRelevantRank : 0;

            const dcg = calculateDCG(relevances);
            const idealRelevances = new Array(q.expected.length).fill(1);
            const idcg = calculateDCG(idealRelevances) || 1;
            ndcgAt10 = Math.min(1.0, Number((dcg / idcg).toFixed(4)));
        }

        details.push({
            id: q.id,
            query: q.query,
            bucket: q.bucket,
            latencyMs,
            resultCount,
            returnedNames,
            recallAt10: Number(recallAt10.toFixed(4)),
            mrr: Number(mrr.toFixed(4)),
            ndcgAt10: Number(ndcgAt10.toFixed(4)),
            zeroResult
        });
    }

    // Summaries per bucket
    const buckets = Array.from(new Set(goldenQueries.map(q => q.bucket)));
    const bucketSummaries: BucketSummary[] = [];

    for (const b of buckets) {
        const bDetails = details.filter(d => d.bucket === b);
        const count = bDetails.length;
        const avgRecall = bDetails.reduce((acc, d) => acc + d.recallAt10, 0) / count;
        const avgMrr = bDetails.reduce((acc, d) => acc + d.mrr, 0) / count;
        const avgNdcg = bDetails.reduce((acc, d) => acc + d.ndcgAt10, 0) / count;
        const zeroCount = bDetails.filter(d => d.zeroResult).length;
        const avgLatency = bDetails.reduce((acc, d) => acc + d.latencyMs, 0) / count;

        bucketSummaries.push({
            bucket: b,
            queryCount: count,
            avgRecall10: Number(avgRecall.toFixed(4)),
            avgMrr: Number(avgMrr.toFixed(4)),
            avgNdcg10: Number(avgNdcg.toFixed(4)),
            zeroResultRate: Number((zeroCount / count).toFixed(4)),
            avgLatencyMs: Math.round(avgLatency)
        });
    }

    // Overall summary
    const overallCount = details.length;
    const overallSummary = {
        bucket: 'OVERALL',
        queryCount: overallCount,
        avgRecall10: Number((details.reduce((acc, d) => acc + d.recallAt10, 0) / overallCount).toFixed(4)),
        avgMrr: Number((details.reduce((acc, d) => acc + d.mrr, 0) / overallCount).toFixed(4)),
        avgNdcg10: Number((details.reduce((acc, d) => acc + d.ndcgAt10, 0) / overallCount).toFixed(4)),
        zeroResultRate: Number((details.filter(d => d.zeroResult).length / overallCount).toFixed(4)),
        avgLatencyMs: Math.round(details.reduce((acc, d) => acc + d.latencyMs, 0) / overallCount)
    };

    const evalReport = {
        timestamp: new Date().toISOString(),
        version: 'amazon-production-v3',
        summary: overallSummary,
        bucketSummaries,
        queryDetails: details
    };

    const outPath = path.resolve(__dirname, 'eval_v3.json');
    fs.writeFileSync(outPath, JSON.stringify(evalReport, null, 2), 'utf8');
    console.log(`Evaluation successfully completed! Report saved to ${outPath}`);
    console.log('Summary:\n', JSON.stringify(overallSummary, null, 2));
    console.log('Buckets:\n', JSON.stringify(bucketSummaries, null, 2));

    await mongoose.disconnect();
}

runEvaluation().catch(err => {
    console.error('Eval error:', err);
    process.exit(1);
});
