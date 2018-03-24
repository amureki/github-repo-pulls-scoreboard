const github = new Octokit();
let githubToken;

chrome.storage.sync.get({
  ghToken: '',
}, function (data) {
  githubToken = data.ghToken;
  init();
});

function parseURL() {
  let urlPath = new URL(location.href).pathname;
  return urlPath.split('/')
}

let [, owner, repo] = parseURL();

function init() {
  github.authenticate({
    type: 'oauth',
    token: githubToken
  });

  function getOpenPRsAndRenderScore() {
    return github.pullRequests.getAll({ owner: owner, repo: repo, per_page: 100 })
      .then(result => { return renderRatings(result.data) })
      .catch(e => { console.warn('Could not load PRs from github', e); throw e; });
  }

  const renderRatings = (pullRequests) => {
    let authorsUsernames = [];
    let assigneesUsernames = [];
    pullRequests.forEach(function (pr) {
      let prAssignees = pr.assignees;
      prAssignees.forEach(function (assignee) {
        assigneesUsernames.push({ 'username': assignee.login });
      });
      authorsUsernames.push({ 'username': pr.user.login });
    });
    authorsUsernames = _.groupBy(authorsUsernames, 'username');
    assigneesUsernames = _.groupBy(assigneesUsernames, 'username');

    let authors = [];
    let assignees = [];

    _.forEach(authorsUsernames, function (items, username) {
      authors.push({ 'username': username, 'count': items.length })
    });
    _.forEach(assigneesUsernames, function (items, username) {
      assignees.push({ 'username': username, 'count': items.length })
    });

    let orderedAuthors = _.orderBy(authors, function (item) { return item.count; }).reverse();
    let orderedAssignees = _.orderBy(assignees, function (item) { return item.count; }).reverse();

    $(".issues-listing").prepend(`
      <ul class="heroes">
        <li class="authors">
          <b>Top by opened PRs</b>
          <ul id="authors"></ul>
        </li>
        <li class="assignees">
          <b>Top by assigned PRs</b>
          <ul id="assignees"></ul>
        </li>
      </ul>
      <hr/>
    `);

    const authorsLi = $("#authors");
    const assigneesLi = $("#assignees");

    orderedAuthors.slice(0,5).forEach(function (author) {
      authorsLi.append("<li>" + author.username + ": " + author.count + "</li>");
    });
    orderedAssignees.slice(0,5).forEach(function (assignee) {
      assigneesLi.append("<li>" + assignee.username + ": " + assignee.count + "</li>");
    });
  };

  getOpenPRsAndRenderScore();
}
