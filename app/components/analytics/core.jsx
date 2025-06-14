import { BlockStack, InlineStack, Card, Text } from '@shopify/polaris'

const Core = ({analytics}) => {
  return (
    <>
     <BlockStack gap="400">
              <InlineStack wrap gap="400">
                <Card rounded shadow>
                  <Text variant="headingMd" fontWeight="bold">{analytics?.total_conversations}</Text>
                  <Text variant="bodyMd">Total Conversations</Text>
                </Card>
    
                <Card rounded shadow>
                  <Text variant="headingMd" fontWeight="bold">{analytics.conversion_rate}%</Text>
                  <Text variant="bodyMd">Conversion Rate</Text>
                </Card>
    
                <Card rounded shadow>
                  <Text variant="headingMd" fontWeight="bold">{analytics.resolution_rate}%</Text>
                  <Text variant="bodyMd">Resolution Rate</Text>
                </Card>
    
                <Card rounded shadow>
                  <Text variant="headingMd" fontWeight="bold">{analytics.response_time_avg} sec</Text>
                  <Text variant="bodyMd">Avg. Response Time</Text>
                </Card>
    
                <Card rounded shadow>
                  <Text variant="headingMd" fontWeight="bold">{analytics.escalation_rate}%</Text>
                  <Text variant="bodyMd">Escalation Rate</Text>
                </Card>
    
                <Card rounded shadow>
                  <Text variant="headingMd" fontWeight="bold">{analytics.unique_visitors}</Text>
                  <Text variant="bodyMd">Unique Visitors</Text>
                </Card>
              </InlineStack>
            </BlockStack>
    </>
  )
}

export default Core