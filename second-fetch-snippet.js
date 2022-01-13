.then(response => {
  response.map((post, index) => {
    return Promise.all([
      fetch(`${domain}/wp-json/wp/v2/media/${post.featured_media}`),
      fetch(`${domain}/wp-json/wp/v2/categories/${post.categories[0]}`)
    ])
      .then(responses => {
        return Promise.all(
          responses.map(response => response.json())
        );
      })
      .then(response => {
        let postObject = {
          category: response[1].name,
          excerpt: truncateExcerpt(post.excerpt.rendered),
          img_url: response[0].source_url,
          link: post.link,
          published: Date.parse(post.date),
          tags: post.tags,
          title: post.title.rendered,
        };

        // pushes postObject to array
        arr.push(postObject);

        return arr;
      })
      .catch(err => console.warn(err));
  });

  return arr;
})


const address = fetch("https://jsonplaceholder.typicode.com/users/1")
  .then((response) => response.json())
  .then((user) => {
    return user.address;
  });

const printAddress = async () => {
  const a = await address;
  console.log(a);
};

printAddress();
