import getCases from '@salesforce/apex/testDataTableController.getCases';
import DataTablePagination from '@salesforce/messageChannel/DataTablePagination__c';
import { subscribe, publish, MessageContext } from 'lightning/messageService';
import { LightningElement, wire, api, track } from 'lwc';

export default class TestDataTable extends LightningElement {
    @wire(MessageContext) messageContext;
    fullData = [];
    @track tableData = [];
    pageSize;
    totalPages;
    subscription = null;
    columns = [
        { label: 'Case Number', fieldName: 'CaseNumber', type: 'text' },
        { label: 'Subject', fieldName: 'Subject', type: 'text' },
        { label: 'Status', fieldName: 'Status', type: 'text' },
        { label: 'Priority Poitns', fieldName: 'PriorityPoitns__c', type: 'text' },
        { label: 'It\'s Important', fieldName: 'It_s_Important__c', type: 'text' }
    ];

    @wire(getCases) wiredCases({ error, data }) {
        if (data) {
            const updatedData = data.map(obj => ({
                ...obj,
                It_s_Important__c: obj.It_s_Important__c ? 'Yes' : 'No'
            }));

            this.fullData = updatedData;

            let message = {
                action: 'updateDataSize',
                actionData: this.fullData.length
            };

            publish(this.messageContext, DataTablePagination, message);
        } else if (error) {
            console.error('Error retrieving Cases:', error);
        }
    }

    connectedCallback() {
        this.handleSubscribe();
    }

    handleSubscribe() {
        if (this.subscription) {
            return;
        }
        this.subscription = subscribe(this.messageContext, DataTablePagination, (message) => {
            this.handlePaginationMessage(message);
        });
    }

    handlePaginationMessage(message) {
        switch (message.action) {
            case 'updateTotalPages':
                this.handleUpdateTotalPages(message);
                break;
            case 'changePage':
                this.goToPage(message.actionData);
                break;
        }
    }

    handleUpdateTotalPages(message) {
        this.pageSize = message.actionData.pageSize;
        this.totalPages = message.actionData.totalPages;
        this.goToPage(1);
    }

    goToPage(pageNumber) {
        if (pageNumber < 1 || pageNumber > this.totalPages) {
            return;
        }
        this.fetchTableData(pageNumber);
    }

    fetchTableData(pageNumber) {
        const startIndex = (pageNumber - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;

        this.tableData = this.fullData.slice(startIndex, endIndex);
    }
}