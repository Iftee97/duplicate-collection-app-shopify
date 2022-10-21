import { Shopify } from "@shopify/shopify-api"

const CREATE_COLLECTION_MUTATION = `mutation collectionCreate($input: CollectionInput!) {
  collectionCreate(input: $input) {
    collection {
      id
    }
    userErrors {
      field
      message
    }
  }
}`

export default async function collectionCreator(session, payload) {
  const client = new Shopify.Clients.Graphql(session.shop, session.accessToken)

  console.log("incomingereodf", payload)

  try {
    await client.query({
      data: {
        query: CREATE_COLLECTION_MUTATION,
        variables: {
          input: {
            ...payload
          },
        },
      },
    })
  } catch (error) {
    if (error instanceof ShopifyErrors.GraphqlQueryError) {
      throw new Error(`${error.message}\n${JSON.stringify(error.response, null, 2)}`)
    } else {
      throw error
    }
  }
}