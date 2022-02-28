//
// DOM CACHING
//
const form = document.querySelector('form');
const apply_button = form.apply;
const download_button = form.download;
const reports_checkbox = form.checkbox;
const reports_dropdown = form.reports;
const repeater = document.querySelector('#repeater');
const radio_inputs = document.querySelectorAll('input[type="radio"]');
const basic_post = document.querySelector('#basicPost');
const cover_post = document.querySelector('#coverPost');
const sponsored_post = document.querySelector('#sponsoredPost');


//
// FUNCTIONS
//
const getReportCategories = (settings) => {
  const { domain, id } = settings;

  fetch(`${domain}/wp-json/wp/v2/categories?parent=${id}`)
    .then((response) => response.json())
    .then((categories) => {
      reports_dropdown.innerHTML = '';

      categories.forEach((category, index) => {
        reports_dropdown.innerHTML += `<option value="${category.id}">${category.name}</option>`;
      });
    })
    .catch(err => console.error(err));
}

const getPosts = async (settings) => {
  const { domain, number_of_posts = 25, publication, report } = settings;
  const str = report ? `${domain}/wp-json/wp/v2/posts?categories=${report}&per_page=${number_of_posts}` : `${domain}/wp-json/wp/v2/posts?per_page=${number_of_posts}`;
  const posts = await (await fetch(str)).json();

  const post_info = Promise.all(
    posts.map(async (post) => {
      const url = await (await fetch(`${domain}/wp-json/wp/v2/media/${post.featured_media}`)).json();
      const category = await (await fetch(`${domain}/wp-json/wp/v2/categories/${post.categories[0]}`)).json();
      const post_obj = {
        alt: url.alt_text,
        category: category.name,
        excerpt: truncateExcerpt(post.excerpt.rendered),
        img_url: url.source_url,
        link: post.link,
        tags: post.tags,
        title: post.title.rendered,
      }

      return post_obj;
    })
  );

  return post_info;
}

const buildDOM = (post) => {
  const { alt, category, excerpt, img_url, link, tags, title } = post;
  const layout = document.createElement('layout');
  let clone;

  if (tags.indexOf(62) !== -1 || tags.indexOf(82) !== -1) {
    clone = cover_post.content.firstElementChild.cloneNode(true);
  } else if (tags.indexOf(345) !== -1 || tags.indexOf(330) !== -1) {
    clone = sponsored_post.content.firstElementChild.cloneNode(true);
  } else {
    clone = basic_post.content.firstElementChild.cloneNode(true);
  }

  const img = clone.querySelector('.post-img');
  img.src = img_url;
  img.alt = alt !== '' ? alt : `Image for ${title}`;

  const a = document.createElement('a');
  a.href = link;
  a.target = '_blank';

  img.parentNode.insertBefore(a, img);
  a.appendChild(img);

  clone.querySelector('.article__category').innerHTML = `<singleline label="Article category">${category}</singleline>`;
  clone.querySelector('.article__title').innerHTML = `<a href="${link}" target="_blank"><singleline label="Article title">${title}</singleline></a>`;
  clone.querySelector('.article__body').innerHTML = `<singleline label="Article excerpt">${excerpt}</singleline>`;

  layout.setAttribute('label', title);
  layout.appendChild(clone);

  repeater.appendChild(layout);
}

const disableCheckbox = (event) => {
  reports_checkbox.checked = false;
  reports_dropdown.disabled = true;
  reports_dropdown.value = '';

  if (['energy_ireland_yearbook', 'irelands_housing_magazine', 'renewable_energy_magazine'].includes(event.currentTarget.value)) {
    reports_checkbox.disabled = true;

    if (!reports_checkbox.parentNode.classList.contains('disabled')) {
      reports_checkbox.parentNode.classList.add('disabled');
    }
  } else {
    reports_checkbox.disabled = false;

    if (reports_checkbox.parentNode.classList.contains('disabled')) {
      reports_checkbox.parentNode.classList.remove('disabled');
    }
  }
}

const updateTheme = (event) => {
  const blocks = document.querySelectorAll('[data-publication]');
  let theme = event.currentTarget.value;

  blocks.forEach((block) => {
    const publications = block.dataset.publication.split(' ');

    if (block.classList.contains('hidden')) block.classList.remove('hidden');

    if (publications.indexOf(theme) === -1) block.classList.add('hidden');
  });
}

const updateDocumentTitle = (publication) => {
  let title;

  switch (publication) {
    case 'eolas_magazine':
      title = 'eolas Magazine';
      break;
    case 'energy_ireland_yearbook':
      title = 'the Energy Ireland Yearbook';
      break;
    case 'irelands_housing_magazine':
      title = 'Ireland’s Housing Magazine';
      break;
    case 'renewable_energy_magazine':
      title = 'the Irish Renewable Energy Magazine';
      break;
    default:
      title = 'agendaNi';
  }

  document.title = `Read the latest articles from ${title}`;
}

const updateDOM = (publication) => {
  const blocks = document.querySelectorAll('[data-publication]');
  const templates = document.querySelectorAll('template');

  blocks.forEach((block) => {
    const publications = block.dataset.publication.split(' ');

    if (publications.indexOf(publication) === -1) block.remove();
  });

  templates.forEach((template) => template.remove());

  switch (publication) {
    case 'energy_ireland_yearbook':
    case 'renewable_energy_magazine':
      document.querySelector('.outer-wrapper').setAttribute('bgColor', '#48A6FE'); // top and bottom borders
      document.querySelectorAll('.js-category').forEach((node) => node.remove());
      break;
    case 'irelands_housing_magazine':
      document.querySelector('.outer-wrapper').setAttribute('bgColor', '#401665');
      document.querySelectorAll('.js-category').forEach((node) => node.remove());
      break;
  }
}

const getSettings = () => {
  const publication = form.publications.value;
  const number_of_posts = form.postCount.value;
  let domain, id, report;

  switch (publication) {
    case 'eolas_magazine':
      domain = 'https://www.eolasmagazine.ie';
      id = 273;
      break;
    case 'energy_ireland_yearbook':
      domain = 'https://www.energyireland.ie';
      break;
    case 'irelands_housing_magazine':
      domain = 'https://www.housing.eolasmagazine.ie';
      break;
    case 'renewable_energy_magazine':
      domain = 'https://www.energyireland.ie';
      break;
    default:
      domain = 'https://www.agendani.com';
      id = 285;
  }

  if (reports_checkbox.checked) {
    report = reports_dropdown.value;
  } else {
    report = '';
  }

  return { publication, number_of_posts, domain, id, report };
}

const enableDownloadButton = () => {
  document.body.classList.remove('loading');
  download_button.classList.remove('loading');
  download_button.removeAttribute('disabled');
}

const applySettings = () => {
  document.body.classList.add('loading');
  download_button.classList.add('loading');
  apply_button.setAttribute('disabled', '');
  document.querySelectorAll('fieldset').forEach(fieldset => fieldset.setAttribute('disabled', ''));

  const settings = getSettings();
  getPosts(settings)
    .then(posts => {
      posts.map(post => buildDOM(post));
    })
    .finally(() => {
      enableDownloadButton();
      updateDocumentTitle(settings.publication);
      updateDOM(settings.publication);
    })
    .catch(err => console.error(err));
}

const downloadHTML = () => {
  document.querySelector('#script').remove();
  document.querySelector('#control-panel').remove();
  document.querySelector('link[href="./control-panel.css"]').remove();

  const hidden_link = document.createElement('a');

  hidden_link.href = `data:text/html;charset=UTF-8,${encodeURIComponent(document.documentElement.outerHTML)}`;
  hidden_link.target = '_blank';
  hidden_link.download = 'newsletter.html';
  hidden_link.click();
}

//
// HELPERS
//
const truncate = (str, word_count) => {
  return str.split(' ')
            .splice(0, word_count)
            .join(' ')
            .concat('', '…');
}

const truncateExcerpt = (excerpt) => {
  const excerpt_trim_start = excerpt.replace('<p>', '');
  const excerpt_trim_end = excerpt_trim_start.replace('</p>', '');
  return (excerpt_truncated = truncate(excerpt_trim_end, 20));
}

//
// EVENT LISTENERS
//
apply_button.addEventListener('click', applySettings, { once: true });
download_button.addEventListener('click', downloadHTML, { once: true });
reports_checkbox.addEventListener('change', () => {
  if (reports_checkbox.checked) {
    form.classList.add('show-reports');
  } else {
    form.classList.remove('show-reports');
    reports_dropdown.value = '';
  }

  if (reports_dropdown.disabled) {
    reports_dropdown.disabled = false;
  } else {
    reports_dropdown.disabled = true;
  }

  const settings = getSettings();

  getReportCategories(settings);
});
radio_inputs.forEach(input => input.addEventListener('change', () => {
  disableCheckbox(event);
  updateTheme(event);
}));
