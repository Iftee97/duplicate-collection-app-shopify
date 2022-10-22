import { useState, useCallback } from 'react'
import {
  Card, CalloutCard, Form, FormLayout, TextField, Button, Thumbnail, Page, Modal, TextContainer, Toast, Frame
} from "@shopify/polaris"
import { ResourcePicker } from "@shopify/app-bridge-react"
import { useForm, useField, notEmptyString } from "@shopify/react-form"
import { useAuthenticatedFetch } from "../hooks"

const sortOrderType = {
  ALPHA_ASC: "ALPHA_ASC",
  ALPHA_DESC: "ALPHA_ASC",
  BEST_SELLING: "BEST_SELLING",
  MANUAL: "MANUAL",
}

export default function CollectionClone() {
  const [showResourcePicker, setShowResourcePicker] = useState(false)
  const [collectionTitle, setCollectionTitle] = useState(null)
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [productList, setProductList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const fetch = useAuthenticatedFetch()

  const onCollectionSelect = useCallback(async ({ selection }) => {
    setSelectedCollection(selection[0])
    setIsLoading(true)
    let cp = selection[0]?.id?.split("/")
    let collectionID = cp[cp.length - 1]
    const response = await fetch(`/api/collection/${collectionID}`)
    if (response.ok) {
      let data = await response.json()
      let productIDList = data?.products?.map(item => `gid://shopify/Product/${item.id}`) || []
      setProductList(productIDList)
      setIsLoading(false)
    }
  }, [setSelectedCollection, selectedCollection])

  const toggleResourcePicker = useCallback(() => {
    setShowResourcePicker(!showResourcePicker)
  }, [showResourcePicker])

  const onSubmit = async () => {
    setIsLoading(true)
    let newCollectionObject = {}
    selectedCollection.ruleSet && (newCollectionObject.ruleSet = selectedCollection.ruleSet)
    selectedCollection.templateSuffix && (newCollectionObject.templateSuffix = selectedCollection.templateSuffix)
    selectedCollection.descriptionHtml && (newCollectionObject.descriptionHtml = selectedCollection.descriptionHtml)
    selectedCollection.ruleSet && (newCollectionObject.ruleSet = selectedCollection.ruleSet)
    newCollectionObject.sortOrder = sortOrderType[selectedCollection.sortOrder]
    if (selectedCollection.image) {
      newCollectionObject.image = { ...selectedCollection.image }
      delete newCollectionObject.image.originalSrc
      newCollectionObject.image.src = selectedCollection.image.originalSrc
    }
    newCollectionObject.seo = selectedCollection.seo
    if (collectionTitle) {
      newCollectionObject.title = collectionTitle
    } else {
      newCollectionObject.title = title.value
    }
    newCollectionObject.products = productList
    const response = await fetch(`/api/collection/create`, {
      method: "POST",
      body: JSON.stringify(newCollectionObject),
      headers: { "Content-Type": "application/json" },
    })

    if (response.ok) {
      setIsLoading(false)
      setShowToast(true)
    }

    makeClean()
  }

  const {
    fields: { title },
    reset,
    makeClean,
  } = useForm({
    fields: {
      title: useField({
        value: `Copy of ${selectedCollection?.title}` || "",
        validates: [notEmptyString("Please name your collection title")],
      })
    },
    onSubmit,
  })

  // ------------------------- MODAL-SPECIFIC HANDLING CODE ---------------------------------
  const [active, setActive] = useState(false)
  const handleChange = useCallback(() => {
    setActive(!active)
    showResourcePicker && toggleResourcePicker()
    selectedCollection && setSelectedCollection(null)
  }, [active])
  const handleCancel = useCallback(() => {
    setActive(false)
    reset()
  }, [reset])
  // ------------------------- MODAL-SPECIFIC HANDLING CODE ---------------------------------

  const handleCollectionTitleChange = useCallback((value) => setCollectionTitle(value), [])

  return (
    <Page>
      <CalloutCard
        title="Duplicate A Collection"
        illustration="https://cdn.shopify.com/s/assets/admin/checkout/settings-customizecart-705f57c725ac05be5a34ec20c05b94298cb8afd10aac7bd9c7ad02030f48cfa0.svg"
        primaryAction={{
          content: 'Get Started',
          onAction: handleChange
        }}
      >
        {!showToast && (
          <>
            <p>Select a collection to duplicate it.</p>
            <Modal
              open={active}
              onClose={handleChange}
              title="Duplicate Collection"
              primaryAction={{
                content: 'Duplicate',
                disabled: !selectedCollection,
                onAction: onSubmit,
                loading: isLoading
              }}
              secondaryActions={[
                {
                  content: 'Cancel',
                  onAction: handleCancel,
                },
              ]}
            >
              <Modal.Section>
                <TextContainer>
                  <p>Select a collection to duplicate it</p>
                  <Button onClick={toggleResourcePicker}>Select a collection</Button>
                  {showResourcePicker && (
                    <ResourcePicker
                      resourceType="Collection"
                      showVariants={false}
                      selectMultiple={false}
                      onSelection={onCollectionSelect}
                      open
                    />
                  )}
                  {selectedCollection && (
                    <Form onSubmit={onSubmit}>
                      <FormLayout>
                        <Card sectioned>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {selectedCollection.image && (
                              <Thumbnail
                                source={`${selectedCollection.image.originalSrc}`}
                                alt="image"
                                size="large"
                              />
                            )}
                            <div style={{ width: '100%', maxWidth: '100%' }}>
                              <TextField
                                {...title}
                                label="Collection Title:"
                                value={collectionTitle || title.value}
                                onChange={handleCollectionTitleChange}
                              />
                            </div>
                          </div>
                        </Card>
                      </FormLayout>
                    </Form>
                  )}
                </TextContainer>
              </Modal.Section>
            </Modal>
          </>
        )}
      </CalloutCard>
      {showToast && (
        <div style={{ height: '25px' }}>
          <Frame>
            <Toast
              content="Collection duplicated successfully"
              onDismiss={() => {
                setShowToast(false)
                handleCancel()
              }}
            />
          </Frame>
        </div>
      )}
    </Page>
  )
}
