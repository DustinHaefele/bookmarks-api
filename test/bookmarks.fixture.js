function makeBookmarksArray() {
  return [
    {
      id: 1,
      title: 'google',
      url: 'https://www.google.com/',
      rating: 5,
      description: 'its google'
    },
    {
      id: 2,
      title: 'Pet finder',
      url: 'https://www.petfinder.com/',
      rating: 4,
      description: 'We love dogs'
    },
    {
      id: 3,
      title: 'CNN',
      url: 'https://www.cnn.com/',
      rating: 5,
      description: 'its news'
    },
    {
      id: 4,
      title: 'Fox News',
      url: 'https://www.foxnews.com/',
      rating: 5,
      description: 'its news?'
    }
  ];
}

module.exports = { makeBookmarksArray };
