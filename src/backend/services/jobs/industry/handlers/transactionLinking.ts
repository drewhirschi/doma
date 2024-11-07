import "dotenv/config";

import { Job, Queue, SandboxedJob } from "bullmq";

import { InvolvedParty } from "../../googlesearch.types";
import { fullAccessServiceClient } from "@shared/supabase-client/server.js";
import { getStructuredCompletion } from "../../llmHelpers";
import { googleSearch } from "../../googlesearch";
import { transactionLinkingSchema } from "@shared/queues/industry-queue.types.js";
import { z } from "zod";

const supabase = fullAccessServiceClient();

export async function transactionCompanyLinking(job: SandboxedJob<z.infer<typeof transactionLinkingSchema>>) {
  const id = job.data.trans_news_id;

  const transactionsGet = await supabase.from("transaction_search_res").select().eq("id", id).single();

  if (transactionsGet.error) {
    throw transactionsGet.error;
  }

  const transaction = transactionsGet.data;

  const transParticipantProms = [
    { trans_id: id, name: transaction.buyer_name, role: "buyer" },
    { trans_id: id, name: transaction.seller_name, role: "seller" },
    ...(transaction.others as [])?.map((other: z.infer<typeof InvolvedParty>) => ({
      trans_id: id,
      name: other.name,
      role: other.role,
    })),
  ]
    .filter((x) => !!x.name)
    .map(async (involvedParty) => {
      const potentialSites = (await googleSearch(`${involvedParty.name} website`)).items.slice(0, 3);

      const bestCandidateWebsite = await getStructuredCompletion({
        schema: z.object({
          id: z.number(),
        }),
        system: `return the id of the website most likely to be the website of ${involvedParty.name}`,
        user: potentialSites
          .map((x, i) =>
            JSON.stringify({
              id: i,
              url: x.link,
              snippet: x.snippet,
              title: x.title,
            }),
          )
          .join("\n"),
      });

      return {
        ...involvedParty,
        websiteOrigin: new URL(potentialSites[bestCandidateWebsite?.id ?? 0].link).origin,
      };
    });

  const companyProfiles = await Promise.all(transParticipantProms);
  const industryQueue = new Queue("industry");

  companyProfiles.map(async (transactionParticipant) => {
    let companyId = 0;
    const companyCheck = await supabase
      .from("company_profile")
      .select()
      .eq("origin", transactionParticipant.websiteOrigin)
      .maybeSingle();

    if (companyCheck.error) {
      throw companyCheck.error;
    }

    if (!companyCheck.data) {
      const insert = await supabase
        .from("company_profile")
        .insert({
          name: transactionParticipant.name,
          origin: transactionParticipant.websiteOrigin,
        })
        .select();
      if (insert.error) {
        throw insert.error;
      }
      companyId = insert.data[0].id;
    } else {
      companyId = companyCheck.data.id;
    }

    const createRelation = await supabase
      .from("transaction_participant")
      .insert({
        trans_id: transactionParticipant.trans_id,
        cmp_id: companyId,
        role: transactionParticipant.role,
      })
      .select();

    if (createRelation.error) {
      throw createRelation.error;
    }

    await industryQueue.add("scrape_company_website", {
      url: transactionParticipant.websiteOrigin,
    });
  });

  const updateTransaction = await supabase.from("transaction_search_res").update({ linked: true }).eq("id", id);

  if (updateTransaction.error) {
    console.error("Failed to set transaction as linked", updateTransaction.error);
    throw updateTransaction.error;
  }
  // await industryQueue.close()
}
