const NUMBER_OF_POSTS = 15; // How many posts to include
const DOMAIN = 'https://www.agendani.com'; // The domain to collect posts from
const REPEATER = document.querySelector('#repeater');

fetch(`${DOMAIN}/wp-json/wp/v2/posts?per_page=${NUMBER_OF_POSTS}`)
  .then(response => {
    return response.json();
  })
  .then(data => {
    data.forEach((post, index) => {

      fetch(`${DOMAIN}/wp-json/wp/v2/media/${post.featured_media}`)
        .then(response => {
          return response.json();
        })
        .then(data => {
          post.img_url = data.source_url;
        })
        .then(data => {;

          fetch(`${DOMAIN}/wp-json/wp/v2/categories/${post.categories[0]}`)
            .then(response => response.json())
            .then(data => {
              post.category = data.name;
            })
            .then(data => {
              let element = document.createElement('layout');

              element.setAttribute('label', `${post.title.rendered}`); // LABELS MUST BE UNIQUE WITHIN A SINGLE REPEATER

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
                                                <p class="article__body"><singleline>${truncate(post.excerpt.rendered, 20)}</singleline></p>
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
              let cover_post = `<tr>
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
                                          <p class="article__body"><singleline label="Cover story excerpt. Use the first twenty words from the story, and add an ellipsis at the end if truncated (ALT + ;)">${truncate(post.excerpt.rendered, 20)}</singleline></p>
                                        </td>
                                      </tr>
                                    </table>

                                  </td>
                                </tr>
                                <tr>
                                  <td height="30" style="font-size:30px; line-height:30px;">&nbsp;</td>
                                </tr>`;
              let sponsored_post = `<tr>
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
                                              <p class="article__body"><singleline label="Story excerpt">${truncate(post.excerpt.rendered, 20)}</singleline></p>
                                            </td>
                                          </tr>
                                        </table>

                                      </td>
                                    </tr>
                                    <tr>
                                      <td height="30" style="font-size:30px; line-height:30px;">&nbsp;</td>
                                    </tr>`;

              // if (post.tags.indexOf(62) !== -1 || post.tags.indexOf(82) !== -1) { // The ID for the 'Cover story' tag is 62 for agendaNi, 82 for eolas
              //   element.innerHTML = cover_post;
              // } else if (post.tags.indexOf(345) !== -1 || post.tags.indexOf(330) !== -1) { // The ID for the 'Sponsored' tag is 345 for agendaNi, 330 for eolas
              //   element.innerHTML = sponsored_post;
              // } else {
              //   element.innerHTML = basic_post;
              // }

              element.innerHTML = basic_post; // Add all stories as a basic post type for now

              REPEATER.appendChild(element);
            })
            .catch(err => {
              console.warn(err);
            });

        })
        .catch(err => {
          console.warn(err);
        });

    });
  })
  .catch(err => {
	  console.warn(err);
  });

function truncate(str, word_count) {
  return str
          .split(" ")
          .splice(0, word_count)
          .join(" ")
          .concat('', '…');
}

let x = document.documentElement;
let y = x.cloneNode(true);
