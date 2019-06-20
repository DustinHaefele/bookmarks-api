#Requirements

***Add an endpoint to support updating bookmarks using a PATCH request

***Ensure the Bookmarks API has a uniform RESTful interface. For example, are the endpoints consistently named?

***Update all of the endpoints to use the /api prefix

Write integration tests for your PATCH request to ensure:

 ***a) It requires the bookmark's ID to be supplied as a URL param

***b) It responds with a 204 and no content when successful

***c) It updates the bookmark in your database table

***d) It responds with a 400 when no values are supplied for any fields (title, url, description, rating)

***e) It allows partial updates, for example, only supplying a new title will only update the title for that item

***Write the appropriate API code to make these tests pass