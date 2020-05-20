angular.module('app').
directive('autoSlide', function() {
  /**
   * the sole purpose of this directive is to initiate carousel animating starting at 
   * page load. normally this can be achieved via the data-ride element attribute, but 
   * the carousel markup is injected into the dom by angular and is not dom-resident
   * at page load. because of this bootstrap doesn't get the message about page load.
   * so in essence, bootstrap isn't bootstrapped.
  */
  return {
    link: function(scope, element) {
      scope.$evalAsync(function() {
        element.carousel();
      });
    }
  }
}).
controller('mvMainCtrl', ['$scope', '$http', 'mvNotifier', 'mvSharedContext', 'mvIdentity', 'MessageService', 'ChartService', 'BarChartService','AgeChartService',
function($scope, $http, mvNotifier, mvSharedContext, mvIdentity, MessageService, ChartService, BarChartService, AgeChartService) {
  var barChart = {
    type: 'ColumnChart',
    data: {
      cols: [{
        id: 'current',
        label: '',
        type: 'string',
        p: {}
      }, {
        id: 'adopted',
        label: 'Already Adopted',
        type: 'number',
        p: {}
      }, {
        id: 'not-adopted',
        label: 'Not Yet Adopted',
        type: 'number',
        p: {}
      }],
      rows : []
    },
    formatters: {
      number: [{
        columnNum: 1,
        pattern: '#,##0'
      }, {
        columnNum: 2,
        pattern: '#,##0'
      }]
    },
    options: {
      axisTitlesPosition: 'none',
      backgroundColor: 'transparent',
      colors: ['#1EA942','#E23D28'],
      displayExactValues: true,
      fontName: 'Helvetica',
      legend: null,
      isStacked: 'true',
      chartArea: {
        width: '80',
        height: '180'
      }
    }
  }, pieChart = {
    type: 'PieChart',
    formatters: {
      number: [{
        columnNum: 1,
        pattern: '#,###'
      }]
    },
    options: {
      backgroundColor: 'transparent',
      colors: ['#00529B','#3491D8','#A3D4F7', '#BADFF9', '#FDB641', '#FCC976', '#FCE0B3','#FFEED6'],
      fontName: 'Helvetica',
      chartArea: {
        height: '180'
      }
    }
  };

  $scope.identity = mvIdentity;
  $scope.message = MessageService.get({
    type : 'HomePageMessage'
  });
  $scope.updateMessage = function() {
    $scope.message.$update().then(function(data) {
      $scope.message = data;
      mvNotifier.notify('Message updated successfully!');
    });
  };
  if (mvSharedContext.message()) {
    mvNotifier.notify(mvSharedContext.message());
    mvSharedContext.clearContext();
  }

  $http.get('/api/stats/specialNeeds').
    then(function(data) {
      var chartArray = [],
          collection = data.data,
          config = angular.copy(pieChart);

      config.data = collection.map(function(item) {
          return (item._id == "None" ? ["No Special Need", item.count] : [item._id, item.count]);
      });

      
      config.data.unshift(['Special Needs', 'Households']);
      $scope.specialChart = config;
    });

    $http.get("/api/stats/age").then(function(data) {
      var chartArray = [],
        collection = data.data,
        config = angular.copy(pieChart);

      if (collection) {
        config.data = collection.map(function(item) {
          return [item._id.type + "-" + item._id.status, item.count];
        });
        config.data.unshift(["Age Group + Status", "Members"]);
        $scope.ageChart = config;
      }
    });

  ChartService.get().$promise.then(function(data) {
    var chartArray = [], chartItem = ["Household Types", "Count"];
    chartArray.push(chartItem);
    angular.forEach(data, function(item) {
       chartItem = [item._id, item.count];
       chartArray.push(chartItem);
    });

    pieChart.data = chartArray;
    $scope.householdChart = pieChart;
  });

  BarChartService.get().$promise.then(function(data) {
    var matched = 0, notmatched = 0;
    angular.forEach(data, function(item) {
      if (item._id == "Matched") {
        matched = item.count;
      } else {
        notmatched = notmatched + item.count;
      }
    });

    //console.log("Matched :"+matched+"  Not Matched:"+notmatched);
    barChart.data.rows = [{
      "c" : [{
        "v" : ""
      }, {
        "v" : matched
      }, {
        "v" : notmatched
      }]
    }];
    $scope.adoptionChart = barChart;

  });

}]);
