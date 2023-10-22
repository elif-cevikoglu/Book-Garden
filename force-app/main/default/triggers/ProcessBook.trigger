trigger ProcessBook on Book__c (before insert, before update) {
    for (Book__c book : Trigger.new) {
        if (Trigger.operationType == System.TriggerOperation.BEFORE_UPDATE) {
            // check if archived
            Book__c oldBook = Trigger.oldMap.get(book.Id);
            if (oldBook.Archived__c && book.Archived__c) {
                book.addError('Archived books can\'t be edited.');
            }
        }
    }
}