
const BookmarkServices = {

  getAllBookmarks(db) {
    return db('bookmarks')
      .select('*');
  },

  getById(db, id){
    return db('bookmarks')
      .where( { id } )
      .returning()
      .first();
  }
};

module.exports = BookmarkServices;

