trigger ProcessBookComment on Book_Comment__c (before insert, before update) {
    for (Book_Comment__c bookComment : Trigger.new) {
        Book__c book = [SELECT Id, Archived__c FROM Book__c WHERE Id = :bookComment.Book__c];
        if (book.Archived__c) {
            bookComment.addError('Archived books can\'t be edited.');
        }
    }
}