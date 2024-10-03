import {createBullBoard} from "@bull-board/api";
import {ExpressAdapter} from "@bull-board/express";
import {BullMQAdapter} from "@bull-board/api/bullMQAdapter";
import {BullAdapter} from "@bull-board/api/bullAdapter";
import * as bullmq from "bullmq";
import * as bull from "bullmq";
import { backOff } from "exponential-backoff";

import {client, redisConfig} from "./redis";
import {config} from "./config";

const serverAdapter = new ExpressAdapter();
const {setQueues} = createBullBoard({queues: [], serverAdapter});
export const router = serverAdapter.getRouter();

async function getBullQueues() {
	// TODO: keys throws an error if no there's 1000 items. scan for the queue names.
	// try {

		// const keys = await client.scan(`${config.BULL_PREFIX}:*`);
	// }
	// const uniqKeys = new Set(keys.map(key => key.replace(/^.+?:(.+?):.+?$/, '$1')));

	// This increases the number of connections.
	// Example: on a cluster I went from an average of 100 to 28k
	// const uniqKeys = new Set(keys.map(key => key.replace(
	// 	new RegExp(`^${config.BULL_PREFIX}:(.+):[^:]+$`),
	// 	'$1'
	// )));

	const queueList = Array.from(config.BULL_QUEUES).sort().map(
		(item) => config.BULL_VERSION === 'BULLMQ' ?
			new BullMQAdapter(new bullmq.Queue(item, {
				connection: redisConfig.redis,
			}, client.connection)) :
			new BullAdapter(new bull.Queue(item, {
				connection: redisConfig.redis,
			}, client.connection))
	);
	if (queueList.length === 0) {
		throw new Error("No queue found.");
	}
	return queueList;
}

async function bullMain() {
	try {
		const queueList = await backOff(() => getBullQueues(), {
			delayFirstAttempt: false,
			jitter: "none",
			startingDelay: config.BACKOFF_STARTING_DELAY,
			maxDelay: config.BACKOFF_MAX_DELAY,
			timeMultiple: config.BACKOFF_TIME_MULTIPLE,
			numOfAttempts: config.BACKOFF_NB_ATTEMPTS,
			retry: (e, attemptNumber) => {
				console.log(`No queue! Retry n°${attemptNumber}`);
				return true;
			},
		});
		setQueues(queueList);
		console.log('🚀 done!')
	} catch (err) {
		console.error(err);
	}
}

bullMain();
