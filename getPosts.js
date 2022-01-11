const getPosts = (settings) => {
  const { domain, number_of_posts, publication, report } = settings;
  let str = '';
  let arr = [];

  console.log({domain}, {number_of_posts}, {publication}, {report});

  if (report) {
    str = `${domain}/wp-json/wp/v2/posts?categories=${report}`;
  } else {
    str = `${domain}/wp-json/wp/v2/posts?per_page=${number_of_posts}`;
  }

  const all_posts = fetch(str, { credentials: 'same-origin' })
    .then(response => response.json())
    .then(response => {
      return response;
    });

  const printAllPosts = async () => {
    const a = await all_posts;
    arr = [...a];
    console.log({arr});
  }

  printAllPosts(); // buildDOM()

  return arr;
}


const getPosts = (settings) => {
  const { domain, number_of_posts, publication, report } = settings;
  let str = '';
  let arr = [];

  // console.log({domain}, {number_of_posts}, {publication}, {report});

  if (report) {
    str = `${domain}/wp-json/wp/v2/posts?categories=${report}`;
  } else {
    str = `${domain}/wp-json/wp/v2/posts?per_page=${number_of_posts}`;
  }

  const all_posts = fetch(str, { credentials: 'same-origin' })
    .then(console.log('starting'))
    .then(response => response.json())
    .then(response => {
      return response.map(post => {
        let postObject = {};

        const p1 = fetch(`${domain}/wp-json/wp/v2/media/${post.featured_media}`)
          .then(response => response.json())
          .then(response => response.source_url)

        const p2 = fetch(`${domain}/wp-json/wp/v2/categories/${post.categories[0]}`)
          .then(response => response.json())
          .then(response => response.name)

        const buildObject = async () => {
          const name = await p1;
          const source_url = await p2;

          postObject = {
            category: name,
            excerpt: truncateExcerpt(post.excerpt.rendered),
            img_url: source_url,
            link: post.link,
            tags: post.tags,
            title: post.title.rendered,
          };

          arr.push(postObject);
        }

        buildObject();
      });
    })
    .then(console.log('finishing'))
    .catch(err => console.warn(err));

  const returnPosts = async () => {
    const a = await all_posts;
    console.log(a);
    console.log(arr);
  }

  returnPosts();
}
