public with sharing class testDataTableController {
    @AuraEnabled(cacheable=true)
    public static List<Case> getCases() {
        return [SELECT Id, CaseNumber, Subject, PriorityPoitns__c, It_s_Important__c, Status FROM Case];
    }
}