/* 
    Create data objects
    List employees

*/

$(function() { //(document).ready

    // Data - Model
    var Employee = Backbone.Model.extend({
      urlRoot: '/api/employee'
    });

    // Data - Collection
    var Employees = Backbone.Collection.extend({
      url: '/api/employees',
      model: Employee
    });

    // View - List
    var EmployeeListView = Backbone.View.extend({
        initialize: function() {
            this.collection = new Employees();
            this.listenTo(this.collection, 'sync', this.render);
            this.collection.fetch();
        },
        render: function() {
            var html_template = $('#listTemplate').html();
            var data = this.collection.toJSON();
            this.$el.html(html_template);
            this.$el.find('.js-data-model').render(data);
            $('#left_column').empty().append(this.$el);
        }
    });

    var employeeListView = new EmployeeListView();


});