/* 
    Create data objects
    List employees
    Show single employee on list item click
    Format Employee Detail template with Directives
    Add Router to Directly Access Employee Detail
    Trigger Route when list item is clicked (changes made to existing code)
    Highlight clicked item in list
    Highlight item in list from Route
    Highlight selected item when render is done
    Add Edit & Save Button, Save Data back to Server
    Added a New Button

*/

// Configure jQuery
$.ajaxSetup({
    headers: {"X-Requested-With": "XMLHttpRequest"},
    dataType : 'json',
    crossDomain: true
});
$.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
    options.url = '' + options.url;
});
//jQuery Plugin
$.fn.serializeObject = function() {
  var o = {};
  var a = this.serializeArray();
  $.each(a, function() {
      if (o[this.name] !== undefined) {
          if (!o[this.name].push) {
              o[this.name] = [o[this.name]];
          }
          o[this.name].push(this.value || '');
      } else {
          o[this.name] = this.value || '';
      }
  });
  return o;
};

$(function() { // document ready

    // Data - Model
    var Employee = Backbone.Model.extend({
      urlRoot: '/employee/'
    });

    // Data - Collection
    var Employees = Backbone.Collection.extend({
      url: '/employee',
      model: Employee
    });

    // View - List
    var EmployeeListView = Backbone.View.extend({
        events: {
            'click #btnNew': 'clickNew',
            'click tbody tr': 'clickItem'
        },
        initialize: function() {
            this.collection = new Employees();
            this.listenTo(this.collection, 'sync', this.render);
            this.listenTo(events, 'employeeDetailView:show', this.setSelectedItem);
            this.collection.fetch();
        },
        directives: {
            id: {
                href: function(object) {
                    return object.value + this.id;
                }
            }
        },
        render: function() {
            var html_template = $('#listTemplate').html();
            var data = this.collection.toJSON();
            this.$el.html(html_template);
            this.$el.find('.js-data-model').render(data, this.directives);
            $('#left_column').empty().append(this.$el);
            this.setSelectedItem();
        },
        clickNew: function(event) {
            event.preventDefault();
            router.navigate('/new', {trigger: true, replace: false});
        },
        clickItem: function(event) {
            event.preventDefault();
            var link = $(event.currentTarget).find('a.js-view-record');
            router.navigate(link.attr('href'), {trigger: true, replace: false});
        },
        setSelectedItem: function(options) {
            this.selectedItemId = (options && options.id) ? options.id : this.selectedItemId;
            if(this.selectedItem) {
                this.selectedItem.removeClass('selected');
            }
            this.selectedItem = $('a[href="/employee/' + this.selectedItemId + '"].js-view-record').parents('tr');
            this.selectedItem.addClass('selected');
        }
    });

    // View - Detail
    var EmployeeDetailView = Backbone.View.extend({
        events: {
            'click #btnEdit': 'enableEdit',
            'click #btnSave': 'save'
        },
        show: function(options) {
                this.model = new Employee({id: options.id});
                this.listenTo(this.model, 'sync', this.render);
                this.model.fetch();
                events.trigger('employeeDetailView:show',{id: options.id});
        },
        new: function() {
                events.trigger('employeeDetailView:show',{id: 'new'});
                this.model = new Employee();
                this.render();
                this.enableEdit();
        },
        directives: {
            employee_photo: {
                src: function(element){
                    return (this.employee_photo) ? this.employee_photo : "/img/employee.png";
                }
            }
        },
        render: function () {
            var html_template = $('#detailTemplate').html();
            var data = this.model.toJSON();
            this.$el.html(html_template);
            this.$el.find('.js-data-model').render(data, this.directives);
            $('#right_column').empty().append(this.$el);
            this.delegateEvents();
        },
        clear: function() {
            this.trigger('clear');
            this.undelegateEvents();
        },
        enableEdit: function() {
            $('#employeeDetail, #btnSave').removeClass('disabled');
            $('#btnEdit').addClass('disabled');
        },
        save: function() {
            var data = $('form#employeeDetail').serializeObject();
            this.model.set(data);
            var jqXHR = this.model.save();

            jqXHR.done(function(data, textStatus, jqXHR){
                console.log(textStatus);
            });

            jqXHR.fail(function(jqXHR, textStatus, errorThrown){
                console.log(jqXHR.responseText);
                console.log(textStatus);
                console.log(errorThrown);
                //console.log(JSON.parse(jqXHR.responseText));
            });
        }
    });

    // Router
    var Router = Backbone.Router.extend({
        routes: {
            '': "index",
            'new':'new',
            'employee/:id': 'employee',
            '*path':  'defaultRoute'
        },
        index: function() {
            userEditView.clear();
        },
        new: function() {
            userEditView.clear();
            userEditView.new();
        },
        employee: function(id) {
            userEditView.show({'id':id});
        },
        defaultRoute: function() {
            console.log('No Route Found');
        }
    });

    var events = _.extend({}, Backbone.Events);
    var employeeListView = new EmployeeListView();
    var userEditView = new EmployeeDetailView();
    var router = new Router();
    Backbone.history.start({pushState: true});

});