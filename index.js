const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts';
const MAX_ATTEMPTS = 3;       // how many times to try before giving up
const RETRY_DELAY_MS = 1000;   // how long to wait between attempts

// Pauses an async function for the given number of milliseconds
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Adds every post to the <ul> with the id of "post-list"
function displayPosts(posts) {
  const postList = document.getElementById('post-list');

  if (!postList) {
    console.error('Could not find a <ul> with the id "post-list" on the page.');
    return;
  }

  // Loop through the posts
  posts.forEach((post) => {
    // Create the new elements
    const listItem = document.createElement('li');
    const postTitle = document.createElement('h1');
    const postBody = document.createElement('p');

    // Fill them in with this post's details
    postTitle.textContent = post.title;
    postBody.textContent = post.body;

    // Put the title and body inside the li, then add the li to the list
    listItem.append(postTitle, postBody);
    postList.append(listItem);
  });
}

// Makes one request to the API and returns the posts (throws if it fails)
async function getPosts() {
  const response = await fetch(POSTS_URL);

  // fetch only fails on network problems, so check for 404/500 ourselves
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

// Fetches the posts (trying again if a request fails), then displays them
async function fetchPosts() {
  let posts = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      posts = await getPosts();
      break; // it worked, so stop trying
    } catch (error) {
      // Shows up in red in the developer tools console
      console.error(`Attempt ${attempt} of ${MAX_ATTEMPTS} failed:`, error);

      // Wait before the next attempt (but not after the last one)
      if (attempt < MAX_ATTEMPTS) {
        await wait(RETRY_DELAY_MS);
      }
    }
  }

  if (posts === null) {
    console.error('Could not load posts after several attempts.');
    return;
  }

  console.log(`Fetched ${posts.length} posts`);

  // Call displayPosts() after the data has arrived
  displayPosts(posts);
}

// Start as soon as the script loads
fetchPosts();