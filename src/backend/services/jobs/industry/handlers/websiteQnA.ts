// const queryEmbedding = await getEmbedding("offered services")
// const match = await supabase.rpc("match_cmp_pages", {
//     query_embedding: queryEmbedding as unknown as string,
//     match_count: 20,
//     match_threshold: 0.1,
//     company_id: companyGet.data.id
// })

// if (match.error) {
//     throw match.error
// }

// console.log(match.data.map(page => page))

// const pagesToVisit = await getCompletion({
//     model: "gpt-4o-2024-08-06",
//     system: "What are the paths that have informaion about what services the company provides?",
//     user: JSON.stringify(match.data.map(page => ({ url: new URL(page.url).pathname, similarity: page.similarity }))),
// })

// console.log(pagesToVisit)
