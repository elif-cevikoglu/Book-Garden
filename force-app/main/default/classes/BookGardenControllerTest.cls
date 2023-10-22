@IsTest
private class BookGardenControllerTest {
    @IsTest
    private static void testGetBooks() {
        Author__c a = new Author__c(Name='TestAuthor');
        insert a;
        Book__c b = new Book__c(Name='TestBook', Author__c=a.Id, Genre__c='Adventure', Number_of_Pages__c=400);
        insert b;
        
        Test.startTest();
        List<Book__c> bookList = BookGardenController.getBooks(1, '', '', 400, '');
        Test.stopTest();
        
        System.assertEquals(bookList.size(), 1);
        System.assertEquals(bookList[0].Name, 'TestBook');
    }
    
    @IsTest
    private static void testGetBookCount() {
        Author__c a = new Author__c(Name='TestAuthor');
        insert a;
        Book__c b = new Book__c(Name='TestBook', Author__c=a.Id, Genre__c='Adventure', Number_of_Pages__c=400);
        insert b;
        
        Test.startTest();
        Integer bookCount = BookGardenController.getBookCount('', '', 400, '');
        Test.stopTest();
        
        System.assertEquals(bookCount, 1);
    }
    
    @IsTest
    private static void testGetBiggestPageNum() {
        Author__c a = new Author__c(Name='TestAuthor');
        insert a;
        Book__c b = new Book__c(Name='TestBook', Author__c=a.Id, Genre__c='Adventure', Number_of_Pages__c=400);
        insert b;
        
        Test.startTest();
        Integer biggestPageNum = BookGardenController.getBiggestPageNum();
        Test.stopTest();
        
        System.assertEquals(biggestPageNum, 400);
    }
    
    @IsTest
    private static void testGetAuthorBooks() {
        Author__c a = new Author__c(Name='TestAuthor');
        insert a;
        Book__c b = new Book__c(Name='TestBook', Author__c=a.Id, Genre__c='Adventure', Number_of_Pages__c=400);
        insert b;
        
        Test.startTest();
        List<Book__c> bookList = BookGardenController.getAuthorBooks(a.Id, a.Name);
        Test.stopTest();
        
        System.assertEquals(bookList[0].Name, 'TestBook');
    }
    
    @IsTest
    private static void testCommentOnBook() {
        Author__c a = new Author__c(Name='TestAuthor');
        insert a;
        Book__c b = new Book__c(Name='TestBook', Author__c=a.Id, Genre__c='Adventure', Number_of_Pages__c=400);
        insert b;
        
        Test.startTest();
        Boolean res = BookGardenController.commentOnBook(b.Id, 'Yes');
        Test.stopTest();
        
        Book_Comment__c bc = [SELECT Id, Book__c, Comment__c FROM Book_Comment__c LIMIT 1];
        System.assertEquals(bc.Book__c, b.Id);
    }
    
    @IsTest
    private static void testReactToBook() {
        Author__c a = new Author__c(Name='TestAuthor');
        insert a;
        Book__c b = new Book__c(Name='TestBook', Author__c=a.Id, Genre__c='Adventure', Number_of_Pages__c=400);
        insert b;
        
        Test.startTest();
        Boolean res = BookGardenController.reactToBook(b.Id, 'like', 1);
        Boolean res2 = BookGardenController.reactToBook(b.Id, 'dislike', 1);
        Test.stopTest();
        
        Book__c b2 = [SELECT Likes__c, Dislikes__c FROM Book__c LIMIT 1];
        System.assertEquals(b2.Likes__c, 1);
        System.assertEquals(b2.Dislikes__c, 1);
    }
    
    @IsTest
    private static void testCreateBook() {
        Author__c a = new Author__c(Name='TestAuthor');
        insert a;
        
        Test.startTest();
        Book__c b = BookGardenController.createBook('TestBook', 'TestAuthor', 'Adventure', 400, '', '', '');
        Test.stopTest();

        System.assertEquals(b.Name, 'TestBook');
        System.assertEquals(b.Author__r.Name, 'TestAuthor');
    }
    
    @IsTest
    private static void testCreateAuthor() {
        Test.startTest();
        Author__c a = BookGardenController.createAuthor('TestAuthor', '', '', '', '', '');
        Test.stopTest();

        System.assertEquals(a.Name, 'TestAuthor');
    }
    
    @IsTest
    private static void testEditBook() {
        Author__c a = new Author__c(Name='TestAuthor');
        insert a;
        Book__c b = new Book__c(Name='TestBook', Author__c=a.Id, Genre__c='Adventure', Number_of_Pages__c=400);
        insert b;
        
        Test.startTest();
        Book__c b2 = BookGardenController.editBook(String.valueOf(b.Id), 'TestCookBook', 'TestAuthor', 'Adventure', 400, '', '', '');
        Test.stopTest();
        
        System.assertEquals(b2.Name, 'TestCookBook');
    }
    
    @IsTest
    private static void testEditAuthor() {
        Author__c a = new Author__c(Name='TestAuthor');
        insert a;
        Book__c b = new Book__c(Name='TestBo"ok', Author__c=a.Id, Genre__c='Adventure', Number_of_Pages__c=400);
        insert b;
        
        Test.startTest();
        Author__c a2 = BookGardenController.editAuthor(a.Id, 'TestOldAuthor', '', '', '', '', '');
        Test.stopTest();
        
        System.assertEquals(a2.Name, 'TestOldAuthor');
    }
    
    @IsTest
    private static void testDeleteBook() {
        Author__c a = new Author__c(Name='TestAuthor');
        insert a;
        Book__c b = new Book__c(Name='TestBook', Author__c=a.Id, Genre__c='Adventure', Number_of_Pages__c=400);
        insert b;
        
        Test.startTest();
        Boolean res = BookGardenController.deleteBook(b.Id);
        Test.stopTest();
        
        List<Book__c> bookList = [SELECT Id FROM Book__c];
        System.assertEquals(bookList.size(), 0);
    }
}