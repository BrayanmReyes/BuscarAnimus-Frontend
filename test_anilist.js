const startOfDay = Math.floor(new Date().setHours(0,0,0,0) / 1000);
const endOfDay = Math.floor(new Date().setHours(23,59,59,999) / 1000);

const query = `
query ($page: Int, $start: Int, $end: Int) {
  Page(page: $page, perPage: 50) {
    airingSchedules(airingAt_greater: $start, airingAt_lesser: $end, sort: TIME) {
      id
      episode
      airingAt
      media {
        title {
          romaji
          english
        }
        coverImage {
          large
        }
      }
    }
  }
}
`;

const variables = {
  page: 1,
  start: startOfDay,
  end: endOfDay
};

fetch('https://graphql.anilist.co', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify({
    query: query,
    variables: variables
  })
})
.then(response => response.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(error => console.error('Error:', error));
