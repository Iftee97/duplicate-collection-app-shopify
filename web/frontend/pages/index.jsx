import { Page, Layout } from "@shopify/polaris"
import { TitleBar } from "@shopify/app-bridge-react"
import CollectionClone from "../components/CollectionClone"

function HomePage() {
  return (
    <Page narrowWidth>
      <TitleBar title="Collection Clone -- Better UI" primaryAction={null} />
      <Layout>
        <Layout.Section>
          <CollectionClone />
        </Layout.Section>
      </Layout>
    </Page>
  )
}

export default HomePage