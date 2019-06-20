
const BookmarkServices = {

  getAllBookmarks(db) {
    return db('bookmarks')
      .select('*');
  },

  getById(db, id){
    return db('bookmarks')
      .where( { id } )
      .returning('*')
      .first();
  },

  deleteBookmark(db, id){
    return db('bookmarks')
      .where({ id })
      .delete();
  },

  insertBookmark(db, newBm){
    return db('bookmarks')
      .insert(newBm)
      .returning('*')
      .then(res=>res[0]);
  },

  updateBookmark(db, id, updatedData){
    return db('bookmarks')
      .where({ id })
      .update(updatedData);
  }
};

module.exports = BookmarkServices;

