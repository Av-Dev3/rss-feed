// Utility for managing saved article lists in localStorage

const LISTS_KEY = 'rss_reader_lists';

export function getLists() {
  try {
    const stored = localStorage.getItem(LISTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error('Failed to load lists:', err);
    return [];
  }
}

export function saveLists(lists) {
  try {
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
    return true;
  } catch (err) {
    console.error('Failed to save lists:', err);
    return false;
  }
}

export function createList(name) {
  const lists = getLists();
  
  // Check if list name already exists
  if (lists.some(list => list.name.toLowerCase() === name.toLowerCase())) {
    throw new Error('List name already exists');
  }

  const newList = {
    id: Date.now().toString(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
    articles: []
  };

  lists.push(newList);
  saveLists(lists);
  return newList;
}

export function deleteList(listId) {
  const lists = getLists();
  const filtered = lists.filter(list => list.id !== listId);
  saveLists(filtered);
}

export function addArticleToList(listId, article) {
  const lists = getLists();
  const list = lists.find(l => l.id === listId);
  
  if (!list) {
    throw new Error('List not found');
  }

  // Check if article already exists in list
  if (list.articles.some(a => a.id === article.id)) {
    throw new Error('Article already in list');
  }

  list.articles.push(article);
  saveLists(lists);
  return list;
}

export function removeArticleFromList(listId, articleId) {
  const lists = getLists();
  const list = lists.find(l => l.id === listId);
  
  if (!list) {
    throw new Error('List not found');
  }

  list.articles = list.articles.filter(a => a.id !== articleId);
  saveLists(lists);
  return list;
}

export function isArticleInList(listId, articleId) {
  const lists = getLists();
  const list = lists.find(l => l.id === listId);
  
  if (!list) {
    return false;
  }

  return list.articles.some(a => a.id === articleId);
}

export function getListsContainingArticle(articleId) {
  const lists = getLists();
  return lists.filter(list => list.articles.some(a => a.id === articleId));
}

