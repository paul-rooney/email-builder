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

//
// FUNCTIONS
//
const getReportCategories = (settings) => {
  const { domain, id } = settings;

  fetch(`${domain}/wp-json/wp/v2/categories?parent=${id}`, { credentials: 'same-origin' })
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
  const { domain, number_of_posts, publication, report } = settings;
  const str = report ? `${domain}/wp-json/wp/v2/posts?categories=${report}` : `${domain}/wp-json/wp/v2/posts?per_page=${number_of_posts}`;
  const posts = await (await fetch(str)).json();

  const post_info = Promise.all(
    posts.map(async (post, index) => {
      const url = await (await fetch(`${domain}/wp-json/wp/v2/media/${post.featured_media}`)).json();
      const category = await (await fetch(`${domain}/wp-json/wp/v2/categories/${post.categories[0]}`)).json();
      const post_obj = {
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
  const { category, excerpt, img_url, link, tags, title } = post;
  const layout = document.createElement('layout');

  layout.setAttribute('label', `${title}`);

  const basic_post = `<table width="640" cellpadding="0" cellspacing="0" border="0" class="wrapper" bgcolor="#E8E8E8">
                      <tr>
                        <td height="30" style="font-size:30px; line-height:30px;">&nbsp;</td>
                      </tr>
                      <tr>
                        <td align="center" valign="top">

                          <table width="600" cellpadding="0" cellspacing="0" border="0" class="container">
                            <tr>
                              <td width="225" class="mobile" align="center" valign="top">
                                <a href="${link}"><img src="${img_url}" alt="" width="225" height="" style="margin:0; padding:0; border:none; display:block;" border="0" class="img" /></a>
                              </td>
                              <td width="30" height="30" style="font-size:30px; line-height:30px;" class="mobile" align="center" valign="top">
                                &nbsp;
                              </td>
                              <td width="345" class="mobile" align="left" valign="top">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">

                                  <tr class="js-category">
                                    <td align="left" valign="top">
                                      <p class="article__category"><singleline label="Category label">${category}</singleline></p>
                                    </td>
                                  </tr>
                                  <tr class="js-category">
                                    <td height="15" style="font-size:15px; line-height:15px;">&nbsp;</td>
                                  </tr>

                                  <tr>
                                    <td align="left" valign="top">
                                      <h2 class="article__title"><a href="${link}"><singleline label="Story title">${title}</singleline></a></h2>
                                      <p class="article__body"><singleline>${excerpt}</singleline></p>
                                    </td>
                                  </tr>

                                </table>
                              </td>
                            </tr>
                          </table>

                        </td>
                      </tr>
                      <tr>
                        <td height="15" style="font-size:15px; line-height:15px;">&nbsp;</td>
                      </tr>
                    </table>`;
  const cover_post = `<table width="640" cellpadding="0" cellspacing="0" border="0" class="wrapper" bgcolor="#E8E8E8">
                      <tr>
                        <td align="center">

                          <table width="640" cellpadding="0" cellspacing="0" border="0" class="wrapper">
                            <tr>
                              <td width="640" class="wrapper">
                                <a href="${link}"><img src="${img_url}" width="640" height="" style="margin:0; padding:0; border:none; display:block;" border="0" class="img" alt="" label="Image for the cover story only. If this is not the cover story, use the one story block instead." /></a>
                              </td>
                            </tr>
                          </table>

                        </td>
                      </tr>
                    </table>

                    <table width="640" cellpadding="0" cellspacing="0" border="0" class="wrapper" bgcolor="#E8E8E8">
                      <tr>
                        <td height="30" style="font-size:30px; line-height:30px;">&nbsp;</td>
                      </tr>
                      <tr>
                        <td align="center" valign="top">

                          <table width="600" cellpadding="0" cellspacing="0" border="0" class="container">
                            <tr>
                              <td align="left" valign="top">
                                <p class="article__category"><singleline label="Category label">Cover story</singleline></p>
                              </td>
                            </tr>
                          </table>

                        </td>
                      </tr>
                    </table>

                    <table width="640" cellpadding="0" cellspacing="0" border="0" class="wrapper" bgcolor="#E8E8E8">
                      <tr>
                        <td height="15" style="font-size:15px; line-height:15px;">&nbsp;</td>
                      </tr>
                      <tr>
                        <td align="center" valign="top">

                          <table width="600" cellpadding="0" cellspacing="0" border="0" class="container">
                            <tr>
                              <td width="285" class="mobile" align="left" valign="top">
                                <h2 class="article__title"><a href="${link}}"><singleline label="Cover story title">${title}</singleline></a></h2>
                              </td>
                              <td width="30" class="mobileOff" align="center" valign="top">
                                &nbsp;
                              </td>
                              <td width="285" class="mobile" align="left" valign="top">
                                <p class="article__body"><singleline label="Cover story excerpt">${excerpt}</singleline></p>
                              </td>
                            </tr>
                          </table>

                        </td>
                      </tr>
                      <tr>
                        <td height="30" style="font-size:30px; line-height:30px;">&nbsp;</td>
                      </tr>
                    </table>`;
  const sponsored_post = `<table width="640" cellpadding="0" cellspacing="0" border="0" class="wrapper" bgcolor="#E8E8E8">
                          <tr>
                            <td height="15" style="font-size:15px; line-height:15px;">&nbsp;</td>
                          </tr>
                          <tr>
                            <td align="center" valign="top">

                              <table width="100%" cellpadding="0" cellspacing="0" border="0" class="[ divider ]">
                                <tr>
                                  <td align="center" valign="top" height="15" style="font-size:15px; line-height:15px;">&nbsp;</td>
                                </tr>
                              </table>

                            </td>
                          </tr>
                        </table>

                        <table width="640" cellpadding="0" cellspacing="0" border="0" class="wrapper" bgcolor="#E8E8E8">
                          <tr>
                            <td height="10" style="font-size:10px; line-height:10px;">&nbsp;</td>
                          </tr>
                          <tr>
                            <td align="center" valign="top">

                              <table width="600" cellpadding="0" cellspacing="0" border="0" class="container">
                                <tr>
                                  <td align="center" valign="top">
                                    <a href="${link}"><img src="${img_url}" width="600" height="" style="margin:0; padding:0; border:none; display:block;" border="0" class="img" alt="" /></a>
                                  </td>
                                </tr>
                              </table>

                            </td>
                          </tr>
                        </table>

                        <table width="640" cellpadding="0" cellspacing="0" border="0" class="wrapper" bgcolor="#E8E8E8">
                          <tr>
                            <td height="30" style="font-size:30px; line-height:30px;">&nbsp;</td>
                          </tr>
                          <tr>
                            <td align="center" valign="top">

                              <table width="600" cellpadding="0" cellspacing="0" border="0" class="container">
                                <tr>
                                  <td width="370" class="mobile" align="left" valign="top">
                                    <p class="article__category"><singleline label="Category label">Round table discussion hosted by</singleline></p>
                                  </td>
                                  <td width="30" class="mobile" align="center" valign="top">
                                    &nbsp;
                                  </td>
                                  <td width="200" class="mobile" align="right" valign="top">
                                    <img src="https://via.placeholder.com/350x100" width="175" height="" style="margin:0; padding:0; border:none; display:block;" border="0" class="" alt="" label="Sponsor logo" editable/>
                                  </td>
                                </tr>
                                <tr>
                                  <td height="15" style="font-size:15px; line-height:15px;">&nbsp;</td>
                                </tr>
                              </table>

                            </td>
                          </tr>
                        </table>

                        <table width="640" cellpadding="0" cellspacing="0" border="0" class="wrapper" bgcolor="#E8E8E8">
                          <tr>
                            <td height="15" style="font-size:15px; line-height:15px;">&nbsp;</td>
                          </tr>
                          <tr>
                            <td align="center" valign="top">

                              <table width="600" cellpadding="0" cellspacing="0" border="0" class="container">
                                <tr>
                                  <td width="285" class="mobile" align="left" valign="top">
                                    <h2 class="article__title"><a href="${link}"><singleline label="Story title">${title}</singleline></a></h2>
                                  </td>
                                  <td width="30" class="mobileOff" align="center" valign="top">
                                    &nbsp;
                                  </td>
                                  <td width="285" class="mobile" align="left" valign="top">
                                    <p class="article__body"><singleline label="Story excerpt">${excerpt}</singleline></p>
                                  </td>
                                </tr>
                              </table>

                            </td>
                          </tr>
                          <tr>
                            <td height="30" style="font-size:30px; line-height:30px;">&nbsp;</td>
                          </tr>
                        </table>`;

  if (tags.indexOf(62) !== -1 || tags.indexOf(82) !== -1) {
    layout.innerHTML = cover_post;
  } else if (tags.indexOf(345) !== -1 || tags.indexOf(330) !== -1) {
    layout.innerHTML = sponsored_post;
  } else {
    layout.innerHTML = basic_post;
  }

  repeater.appendChild(layout);
}

const disableCheckbox = (event) => {
  reports_checkbox.checked = false;
  reports_dropdown.disabled = true;
  reports_dropdown.value = '';

  if (event.currentTarget.value === 'energy_ireland_yearbook' || event.currentTarget.value === 'irelands_housing_magazine' || event.currentTarget.value === 'renewable_energy_magazine') {
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

const enableDownloadButton = () => {
  download_button.classList.remove('loading');
  download_button.removeAttribute('disabled');
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

  blocks.forEach((block) => {
    const publications = block.dataset.publication.split(' ');

    if (publications.indexOf(publication) === -1) block.remove();
  });

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

const applySettings = () => {
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
radio_inputs.forEach(input => input.addEventListener('change', () => disableCheckbox(event)));
