// DOM CACHING
const form = document.querySelector('form');
const repeater = document.querySelector('#repeater');
const getPostsButton = document.querySelector('#getPosts');
const downloadButton = document.querySelector('#downloadHTML');





// FUNCTIONS
function getPosts(domain, numberOfPosts) {
  fetch(`${domain}/wp-json/wp/v2/posts?per_page=${numberOfPosts}`, { credentials: 'same-origin' })
  .then(response => response.json())
  .then(data => {
    data.forEach((post, index) => {

      Promise.all([
        fetch(`${domain}/wp-json/wp/v2/media/${post.featured_media}`),
        fetch(`${domain}/wp-json/wp/v2/categories/${post.categories[0]}`)
      ])
        .then(responses => {
          return Promise.all(responses.map(response => {
            return response.json();
          }))
        })
        .then(data => {
          post.img_url = data[0].source_url;
          post.category = data[1].name;

          let element = document.createElement('layout');
          element.setAttribute('label', `${post.title.rendered}`);

          // PULL OUT INTO ITS OWN FUNCTION
          let excerptTrimStart = post.excerpt.rendered.replace('<p>', '');
          let excerptTrimEnd = excerptTrimStart.replace('</p>', '');
          let excerptTruncated = truncate(excerptTrimEnd, 20);

          let basic_post = `<table width="640" cellpadding="0" cellspacing="0" border="0" class="wrapper" bgcolor="#E8E8E8">
                              <tr>
                                <td height="30" style="font-size:30px; line-height:30px;">&nbsp;</td>
                              </tr>
                              <tr>
                                <td align="center" valign="top">

                                  <table width="600" cellpadding="0" cellspacing="0" border="0" class="container">
                                    <tr>
                                    <td width="225" class="mobile" align="center" valign="top">
                                      <a href="${post.link}"><img src="${post.img_url}" alt="" width="225" height="" style="margin:0; padding:0; border:none; display:block;" border="0" class="img" editable /></a>
                                    </td>
                                    <td width="30" height="30" style="font-size:30px; line-height:30px;" class="mobile" align="center" valign="top">
                                      &nbsp;
                                    </td>
                                    <td width="345" class="mobile" align="left" valign="top">
                                      <table width="100%" cellpadding="0" cellspacing="0" border="0">


                                      <tr>
                                        <td align="left" valign="top">
                                          <p class="article__category"><singleline label="Category label">${post.category}</singleline></p>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td height="15" style="font-size:15px; line-height:15px;">&nbsp;</td>
                                      </tr>


                                        <tr>
                                          <td align="left" valign="top">
                                            <h2 class="article__title"><a href="${post.link}"><singleline label="Story title">${post.title.rendered}</singleline></a></h2>
                                            <p class="article__body"><singleline>${excerptTruncated}</singleline></p>
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
          let cover_post = `<table width="640" cellpadding="0" cellspacing="0" border="0" class="wrapper" bgcolor="#E8E8E8">
                              <tr>
                                <td align="center">

                                  <table width="640" cellpadding="0" cellspacing="0" border="0" class="wrapper">
                                    <tr>
                                      <td width="640" class="wrapper">
                                        <a href="${post.link}"><img src="${post.img_url}" width="640" height="" style="margin:0; padding:0; border:none; display:block;" border="0" class="img" alt="" label="Image for the cover story only. If this is not the cover story, use the one story block instead." editable /></a>
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
                                        <h2 class="article__title"><a href="${post.link}}"><singleline label="Cover story title">${post.title.rendered}</singleline></a></h2>
                                      </td>
                                      <td width="30" class="mobileOff" align="center" valign="top">
                                        &nbsp;
                                      </td>
                                      <td width="285" class="mobile" align="left" valign="top">
                                        <p class="article__body"><singleline label="Cover story excerpt. Use the first twenty words from the story, and add an ellipsis at the end if truncated (ALT + ;)">${excerptTruncated}</singleline></p>
                                      </td>
                                    </tr>
                                  </table>

                                </td>
                              </tr>
                              <tr>
                                <td height="30" style="font-size:30px; line-height:30px;">&nbsp;</td>
                              </tr>
                            </table>`;
          let sponsored_post = `<table width="640" cellpadding="0" cellspacing="0" border="0" class="wrapper" bgcolor="#E8E8E8">
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
                                            <a href="${post.link}"><img src="${post.img_url}" width="600" height="" style="margin:0; padding:0; border:none; display:block;" border="0" class="img" alt="" editable /></a>
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
                                            <h2 class="article__title"><a href="${post.link}"><singleline label="Story title">${post.title.rendered}</singleline></a></h2>
                                          </td>
                                          <td width="30" class="mobileOff" align="center" valign="top">
                                            &nbsp;
                                          </td>
                                          <td width="285" class="mobile" align="left" valign="top">
                                            <p class="article__body"><singleline label="Story excerpt">${excerptTruncated}</singleline></p>
                                          </td>
                                        </tr>
                                      </table>

                                    </td>
                                  </tr>
                                  <tr>
                                    <td height="30" style="font-size:30px; line-height:30px;">&nbsp;</td>
                                  </tr>
                                </table>`;

          // The ID for the 'Cover story' tag is 62 for agendaNi, 82 for eolas
          if (post.tags.indexOf(62) !== -1 || post.tags.indexOf(82) !== -1) {
            element.innerHTML = cover_post;
          // The ID for the 'Sponsored' tag is 345 for agendaNi, 330 for eolas
          } else if (post.tags.indexOf(345) !== -1 || post.tags.indexOf(330) !== -1) {
            element.innerHTML = sponsored_post;
          } else {
            element.innerHTML = basic_post;
          }

          repeater.appendChild(element);

          if (index === numberOfPosts - 1) disableThings();
        })
        .catch(err => console.warn(err));

    });
  })
  .catch(err => console.warn(err));
}

function truncate(str, word_count) {
  return str
          .split(" ")
          .splice(0, word_count)
          .join(" ")
          .concat('', '…');
}

function updateTitle(publication) {
  document.querySelector('title').innerHTML = `${publication} • Read the latest articles from ${publication === 'Energy Ireland Yearbook' ? 'the ' + publication : publication}`;
}

function updateBlocks(publication) {
  const blocks = document.querySelectorAll('[data-publication]');

  blocks.forEach(block => {
    if (block.dataset.publication !== publication) {
      block.remove();
    }
  });
}

function disableThings() {
  downloadButton.removeAttribute('disabled');
}





// EVENT LISTENERS
getPostsButton.addEventListener('click', (e) => {
  e.preventDefault();

  const numberOfPosts = form.postcount.value;
  const publication = form.publications.value;
  let domain;

  switch (publication) {
    case 'eolas Magazine':
      domain = 'https://www.eolasmagazine.ie';
      break;
    case 'Ireland’s Housing Magazine':
      domain = 'https://www.housing.eolasmagazine.ie';
      break;
    case 'Energy Ireland Yearbook':
      domain = 'https://www.energyireland.ie';
      break;
    case 'Irish Renewable Energy Magazine':
      domain = 'https://www.irishrenewableenergy.energyireland.ie';
      break;
    default:
      domain = 'https://www.agendani.com';
  }

  getPosts(domain, numberOfPosts);

  updateTitle(publication);
  updateBlocks(publication);

  getPostsButton.setAttribute('disabled', '');
  document.querySelectorAll('fieldset').forEach(fieldset => fieldset.setAttribute('disabled', ''));
}, { once: true });

downloadButton.addEventListener('click', () => {
  document.querySelector('#script').remove();
  document.querySelector('#control-panel').remove();
  document.querySelector('link[href="./control-panel.css"]').remove();

  const hiddenLink = document.createElement('a');

  hiddenLink.href = `data:text/html;charset=UTF-8,${encodeURIComponent(document.documentElement.outerHTML)}`;
  hiddenLink.target = '_blank';
  hiddenLink.download = 'newsletter.html';
  hiddenLink.click();
}, { once: true });
