import { ApiClient } from './api-client';

const apiClient = new ApiClient(process.env.SHOP_URL as string, process.env.SHOP_ADMIN_USERNAME as string, process.env.SHOP_ADMIN_PASSWORD as string)

type SalesChannel = {
  id: string;
  name: string;
  accessKey: string;
  domains: {
    url: string;
  }[],
  countries: {
    id: string;
  }[]
}

async function fetchSalesChannel() {
  const response = await apiClient.post<{ data: SalesChannel[] }>('/search/sales-channel', {
    fields: ["id", "name", "accessKey", "domains.url", "countries.id"],
    filter: [
      {
        type: "equals",
        field: "active",
        value: true,
      },
      {
        type: "not",
        queries: [
          {
            type: "equals",
            field: "name",
            value: "Headless",
          },
        ],
      },
    ],
  });

  const salutationIds = await apiClient.post<{ data: string[] }>('/search-ids/salutation', {});

  const taxIds = await apiClient.post<{ data: string[] }>('/search-ids/tax', {});

  const records = response.body.data.map((record) => {
    return {
      id: record.id,
      name: record.name,
      accessKey: record.accessKey,
      url: record.domains[0].url,
      countryIds: record.countries.map((e) => e.id),
      salutationIds: salutationIds.body.data,
      taxIds: taxIds.body.data,
      api: {
        baseURL: `${process.env.SHOP_URL}/api`,
        credentials: {
          grant_type: "password",
          client_id: "administration",
          scopes: "write",
          username: process.env.SHOP_ADMIN_USERNAME as string,
          password: process.env.SHOP_ADMIN_PASSWORD as string,
        },
      },
    };
  });

  Bun.write("fixtures/sales-channel.json", JSON.stringify(records));
  console.log(`Collected ${records.length} sales channels`);
  console.log(`Collected ${salutationIds.body.data.length} salutations`);

  return records[0];
}

const salesChannel = await fetchSalesChannel();

async function fetchSeoUrls(name: string) {
  const pageSize = 100;  // Set to an appropriate limit supported by the API
  let allSeoUrls = [];
  let page = 1;

  while (true) {
    // Fetch each page of results
    const response = await apiClient.post<{ data: { seoPathInfo: string, foreignKey: string }[] }>('/search/seo-url', {
      fields: ["seoPathInfo", "foreignKey"],
      filter: [
        {
          type: "equals",
          field: "routeName",
          value: name,
        },
        {
          type: "equals",
          field: "isCanonical",
          value: true,
        },
        {
          type: "equals",
          field: "isDeleted",
          value: false,
        },
        {
          type: "equals",
          field: "salesChannelId",
          value: salesChannel.id,
        },
      ],
      limit: pageSize,
      page: page,  // Specify the current page
    });

    // Add the fetched SEO URLs to the main list
    const seoUrls = response.body.data;
    allSeoUrls = allSeoUrls.concat(seoUrls);

    // Stop if there are no more results to fetch
    if (seoUrls.length < pageSize) break;

    page++;  // Move to the next page
  }

// Format the data for output
  const data = allSeoUrls.map((seoUrl) => {
    return {
      url: `${salesChannel.url}/${seoUrl.seoPathInfo}`,
      id: seoUrl.foreignKey,
    };
  });

// Write the collected data to a file
  Bun.write(`fixtures/seo-${name}.json`, JSON.stringify(data));
  console.log(`Collected ${data.length} seo urls for ${name}`);
}

async function fetchMedia() {
  const mediaIds = await apiClient.post<{ data: string[] }>('/search-ids/media', {
    limit: 500,
  });

  Bun.write(`fixtures/media.json`, JSON.stringify(mediaIds.body.data));
  console.log(`Collected ${mediaIds.body.data.length} media ids`);
}

async function fetchProperties() {
  const propertyIds = await apiClient.post<{ data: string[] }>('/search-ids/property-group', {
    limit: 500,
  });

  Bun.write(`fixtures/property_group_option.json`, JSON.stringify(propertyIds.body.data));
  console.log(`Collected ${propertyIds.body.data.length} property ids`);
}

await Promise.all([
  fetchProperties(),
  fetchMedia(),
  fetchSeoUrls("frontend.navigation.page"),
  fetchSeoUrls("frontend.detail.page"),
]);

const keywords = await apiClient.post<{ data: { keyword: string }[] }>('/search/product-search-keyword', {
  limit: 500,
});

const uniqueKeywords = keywords.body.data
  .map((k) => k.keyword)
  .filter((value, index, array) => array.indexOf(value) === index);

Bun.write("fixtures/keywords.json", JSON.stringify(uniqueKeywords));
console.log(`Collected ${uniqueKeywords.length} search keywords`);
