/**
* @author Elif Çevikoğlu
* @date October 2023
* @description Apex class for Book Garden.
*/
public with sharing class BookGardenController {
    @AuraEnabled
    public static List<Book__c> getBooks(Integer pageInt, String bookName, String authorName, Integer nop, String genreStr) {
        try {
            String bookN = '\'%'+bookName+'%\'';
            String authorN = '\'%'+authorName+'%\'';
            String genreN = ' ';
            if (!String.isEmpty(genreStr)) {
                genreN += ' AND Genre__c INCLUDES( \''+genreStr+'\')';
            }

            Integer limitInt = 6;
            Integer offsetInt = (limitInt * pageInt) - 6;
    
            //Turn to 'dynamic soql'
            String queryStr = 'SELECT Id, Archived__c, CreatedDate, Name, CreatedBy.Name, CreatedBy.SmallPhotoUrl, Author__r.Name, Author__r.Born_In__c, Author__r.Died_In__c, Author__r.From__c, Author__r.Life__c,  ' +
            ' Author__r.Image_Source__c,  Review__c, Genre__c, Image_Source__c, Number_of_Pages__c, Summary__c, Likes__c, Dislikes__c, ' +
            ' (SELECT Name, Book__c, CreatedDate, CreatedBy.Name, CreatedBy.SmallPhotoUrl, Comment__c FROM Comments__r ORDER BY CreatedDate) ' +
                                ' FROM Book__c WHERE Name LIKE '+bookN+' AND Author__r.Name LIKE '+authorN+
                                ' AND Number_of_Pages__c <= '+nop+genreN+
                                ' ORDER BY Name LIMIT '+limitInt+' OFFSET '+offsetInt;
            List<Book__c> books = Database.query(queryStr);
            return books;
        } catch(Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Integer getBookCount(String bookName, String authorName, Integer nop, String genreStr) {
        try {
            String bookN = '\'%'+bookName+'%\'';
            String authorN = '\'%'+authorName+'%\'';
            String genreN = ' ';
            if (!String.isEmpty(genreStr)) {
                genreN += ' AND Genre__c INCLUDES( \''+genreStr+'\')';
            }
            String queryStr = 'SELECT COUNT() FROM Book__c WHERE Name LIKE '+bookN+' AND Author__r.Name LIKE '+authorN+
                                ' AND Number_of_Pages__c <= '+nop+genreN;
            //error: use countQuery
            return Database.countQuery(queryStr);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Integer getBiggestPageNum() {
        try {
            Book__c biggestBook = [SELECT Number_of_Pages__c FROM Book__c ORDER BY Number_of_Pages__c DESC LIMIT 1];
            return Integer.valueOf(biggestBook.Number_of_Pages__c);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<Book__c> getAuthorBooks(String authorId, String authorName) {
        try {
            return [SELECT Id, Name, CreatedBy.Name, Author__r.Name, Author__r.Born_In__c, Author__r.Died_In__c, Author__r.From__c, Author__r.Life__c, 
                    Review__c, Genre__c, Image_Source__c, Number_of_Pages__c,Summary__c 
                    FROM Book__c WHERE Author__c = :authorId LIMIT 6];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Boolean reactToBook(String bookId, String reaction, Integer amount) {
        try {
            if (reaction == 'like') {
                Book__c b = [SELECT Id, Likes__c FROM Book__c WHERE Id = :bookId];
                b.Likes__c = amount;
                update b;
            } else {
                Book__c b = [SELECT Id, Dislikes__c FROM Book__c WHERE Id = :bookId];
                b.Dislikes__c = amount;
                update b;
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @AuraEnabled
    public static Boolean commentOnBook(String bookId, String comment) {
        try {
            Book_Comment__c bc = new Book_Comment__c(Book__c = bookId, Comment__c = comment);
            insert bc;
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @AuraEnabled
    public static Book__c createBook(String bookName, String authorName, String genre, Integer numberOfPages, String review, String summary, String imageSource) {
        try {

            List<Author__c> authorList = [SELECT Id FROM Author__c WHERE Name = :authorName];
            String authorId;
            if (authorList.size() > 0) {
                authorId = authorList[0].Id;
            } else {
                Author__c author = new Author__c(Name=authorName);
                insert author;
                authorId = author.Id;
            }

            Book__c book = new Book__c(Name=bookName, Author__c=authorId, Genre__c=genre, Number_of_Pages__c=numberOfPages, Review__c=review, Summary__c=summary, Image_Source__c=imageSource);
            insert book;

            Book__c bookRes = [SELECT Id, Archived__c, CreatedDate, Name, CreatedBy.Name, CreatedBy.SmallPhotoUrl, Author__r.Name, Author__r.Born_In__c, Author__r.Died_In__c, Author__r.From__c, Author__r.Life__c, 
                                    Author__r.Image_Source__c, Review__c, Genre__c, Image_Source__c, Number_of_Pages__c, Summary__c, Likes__c, Dislikes__c,
                                    (SELECT Name, Book__c, CreatedDate, CreatedBy.Name, CreatedBy.SmallPhotoUrl, Comment__c FROM Comments__r ORDER BY CreatedDate) 
                                FROM Book__c WHERE Id = :book.Id];
            return bookRes;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Author__c createAuthor(String authorName, String fromStr, String bornIn, String diedIn, String lifeStr, String imageSource) {
        try {
            Date bornInDate;
            Date diedInDate;
            if (!String.isEmpty(bornIn)) {
                bornInDate = Date.valueOf(bornIn);
            }
            if (!String.isEmpty(diedIn)) {
                diedInDate = Date.valueOf(diedIn);
            }

            Author__c author = new Author__c(Name=authorName, From__c=fromStr, Born_In__c=bornInDate, Died_In__c=diedInDate, Life__c=lifeStr, Image_Source__c=imageSource);
            insert author;

            Author__c authorRes = [SELECT Id, CreatedDate, Name, CreatedBy.Name, CreatedBy.SmallPhotoUrl, Born_In__c, Died_In__c, 
                                    From__c, Life__c, Image_Source__c
                                    FROM Author__c WHERE Id = :author.Id];
            return authorRes;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled
    public static Book__c editBook(String bookId, String bookName, String authorName, String genre, Integer numberOfPages, String review, String summary, String imageSource) {
        try {
            Book__c bookToEdit = [SELECT Id, Archived__c, CreatedDate, Name, CreatedBy.Name, CreatedBy.SmallPhotoUrl, Author__r.Name, Author__r.Born_In__c, Author__r.Died_In__c, Author__r.From__c, Author__r.Life__c, 
                            Author__r.Image_Source__c, Review__c, Genre__c, Image_Source__c, Number_of_Pages__c, Summary__c, Likes__c, Dislikes__c,
                            (SELECT Name, Book__c, CreatedDate, CreatedBy.Name, CreatedBy.SmallPhotoUrl, Comment__c FROM Comments__r ORDER BY CreatedDate) 
                            FROM Book__c WHERE Id = :bookId];

            List<Author__c> authorList = [SELECT Id FROM Author__c WHERE Name = :authorName];
            String authorId;
            if (authorList.size() > 0) {
                authorId = authorList[0].Id;
            } else {
                Author__c author = new Author__c(Name=authorName);
                insert author;
                authorId = author.Id;
            }

            bookToEdit.Name=bookName;
            bookToEdit.Author__c=authorId;
            bookToEdit.Genre__c=genre;
            bookToEdit.Number_of_Pages__c=numberOfPages;
            bookToEdit.Review__c=review;
            bookToEdit.Summary__c=summary;
            bookToEdit.Image_Source__c=imageSource;
            update bookToEdit;

            return bookToEdit;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Author__c editAuthor(String authorId, String authorName, String fromStr, String bornIn, String diedIn, String lifeStr, String imageSource) {
        try {
            Author__c authorToEdit = [SELECT Id, CreatedDate, Name, CreatedBy.Name, CreatedBy.SmallPhotoUrl, Born_In__c, Died_In__c, 
                                    From__c, Life__c, Image_Source__c
                                    FROM Author__c WHERE Id = :authorId];

            Date bornInDate;
            Date diedInDate;
            if (!String.isEmpty(bornIn)) {
                bornInDate = Date.valueOf(bornIn);
            }
            if (!String.isEmpty(diedIn)) {
                diedInDate = Date.valueOf(diedIn);
            }

            authorToEdit.Name=authorName;
            authorToEdit.From__c=fromStr;
            authorToEdit.Born_In__c=bornInDate;
            authorToEdit.Died_In__c=diedInDate;
            authorToEdit.Life__c=lifeStr;
            authorToEdit.Image_Source__c=imageSource;
            update authorToEdit;


            return authorToEdit;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Boolean deleteBook(String bookId) {
        try {
            Book__c bookToDelete = [SELECT Id FROM Book__c WHERE Id = :bookId];
            delete bookToDelete;

            return true;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Boolean archiveBook(String bookId, Boolean archived) {
        try {
            Book__c bookToArchive = [SELECT Id, Archived__c FROM Book__c WHERE Id = :bookId];
            bookToArchive.Archived__c = archived;
            update bookToArchive;

            return true;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}