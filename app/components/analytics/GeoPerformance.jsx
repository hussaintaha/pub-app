import React from 'react'
import { Card, Text, BlockStack, InlineStack, DataTable } from '@shopify/polaris'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { scaleLinear } from 'd3-scale'

// World GeoJSON
const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const GeoPerformance = ({ geographicData }) => {
  const maxConversations = Math.max(...geographicData.map((c) => c.conversations))

  const colorScale = scaleLinear()
    .domain([0, maxConversations])
    .range(['#D0E3FF', '#0064CC'])

  const countryMap = Object.fromEntries(
    geographicData.map((c) => [c.country.toLowerCase(), c.conversations])
  )

  const ChartCard = ({ title, children }) => (
    <Card padding="400" roundedAbove="sm">
      <BlockStack gap="300">
        <Text variant="headingSm" as="h3">{title}</Text>
        <div style={{ width: '100%'}}>{children}</div>
      </BlockStack>
    </Card>
  )

  return (
    <div style={{marginTop:"16px"}}>
        <BlockStack gap="400">
        {/* World Map */}
        <div className="responsive-card">
          <ChartCard title="Conversations by Country">
            <ComposableMap>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const countryName = geo.properties.name.toLowerCase()
                    const value = countryMap[countryName] || 0
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={colorScale(value)}
                        stroke="#FFF"
                      />
                    )
                  })
                }
              </Geographies>
            </ComposableMap>
          </ChartCard>
        </div>

        {/* Table */}
        <div className="responsive-card">
          <ChartCard title="Country Stats">
            <DataTable
              columnContentTypes={['text', 'numeric', 'numeric']}
              headings={['Country', 'Conversations', 'Conversion Rate']}
              rows={geographicData.map((item) => [
                item.country,
                item.conversations,
                `${item.conversion_rate}%`
              ])}
              increasedTableDensity
            />
          </ChartCard>
        </div>
    </BlockStack>
    </div>
  )
}

export default GeoPerformance
