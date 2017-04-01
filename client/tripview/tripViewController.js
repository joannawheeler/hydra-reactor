angular.module('tripViewModule', [
  'ui.bootstrap'
])

.controller('tripViewController', ['$scope', '$http', 'User', function($scope, $http, User) {
  // DUMMY DATA FOR TESTING
  $scope.itinerary = [
    { startDate: new Date(2017, 3, 31), title: 'Dinner' },
    { startDate: new Date(2017, 4, 1), title: 'Scuba Diving' },
    { startDate: new Date(2017, 4, 2), title: 'Rock Climbing' }
  ];
  $scope.suggestions = [
    {
      yelpBusinessName: 'The Temporarium Coffee & Tea',
      yelpUrl: 'https://www.yelp.com/biz/the-temporarium-coffee-and-tea-san-francisco?adjust_creative=p8w_DRU96tNeK6xL8dcptg&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=p8w_DRU96tNeK6xL8dcptg',
      yelpRating: 5,
      yelpPriceRange: '$',
      yelpID: 'the-temporarium-coffee-and-tea-san-francisco',
      yelpReviewCount: 128,
      yelpImage: 'https://s3-media4.fl.yelpcdn.com/bphoto/6KUXPGhWFhUo1SfEwCCr7Q/o.jpg',
      totalLikes: 10,
      description: 'Description 1',
      category: 'coffee'
    },
    {
      yelpBusinessName: 'DeSano Pizza bakery',
      yelpUrl: 'https://www.yelp.com/biz/desano-pizza-bakery-los-angeles?adjust_creative=p8w_DRU96tNeK6xL8dcptg&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=p8w_DRU96tNeK6xL8dcptg',
      yelpRating: 4.5,
      yelpPriceRange: '$$',
      yelpID: 'desano-pizza-bakery-los-angeles',
      yelpReviewCount: 620,
      yelpImage: 'https://s3-media2.fl.yelpcdn.com/bphoto/51Ew_R8Cpk1MlA3jZXaXqA/o.jpg',
      totalLikes: 3,
      description: 'Description 2',
      category: 'restaurants'
    },
    {
      yelpBusinessName: 'Wanderlust Creamery',
      yelpUrl: 'https://www.yelp.com/biz/wanderlust-creamery-los-angeles-2?adjust_creative=p8w_DRU96tNeK6xL8dcptg&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=p8w_DRU96tNeK6xL8dcptg',
      yelpRating: 4.5,
      yelpPriceRange: '$',
      yelpID: '"wanderlust-creamery-los-angeles-2"',
      yelpReviewCount: 48,
      yelpImage: 'https://s3-media3.fl.yelpcdn.com/bphoto/Rydcljn2hHBl-lqNCmVzyw/o.jpg',
      totalLikes: 5,
      description: 'Description 3',
      category: 'desserts'
    }
  ];

  // invite a friend field
  $scope.isCollapsed = true;

  // Calendar variables - $scope.dt is the actual date value
  $scope.format = 'yyyy/MM/dd';
  $scope.dateOptions = {
    formatYear: 'yy',
    maxDate: new Date(2027, 1, 1),
    minDate: new Date(),
    startingDay: 1
  };
  $scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.clear = function() {
    $scope.dt = null;
  };
  $scope.popup = {
    opened: false
  };
  $scope.open = function() {
    $scope.popup.opened = true;
  };
  $scope.today();

  // Suggest tab functions and variables
  // current carousel item index
  $scope.active = 0;
  $scope.businessRating = 0;

  $scope.allCategories = [];  // "title" is shown on page, "alias" is the category value
  $scope.results = [];
  $scope.reviews = [];
  $scope.morePhotos = [];
  $scope.showAdditionalInfo = false;
  $scope.categories = 'coffee';
  $scope.term = 'peets';
  $scope.location = 'Los Angeles, CA, USA';

  // Watches for changes in the carousel
  $scope.$watch('active', function(index) {
    if ($scope.results.length !== 0) {
      // Hide header until new review/photo results are in
      $scope.showAdditionalInfo = false;
      $scope.businessRating = $scope.results[index].rating;
      $scope.businessDetails(index);
    }
  });

  // Search yelp based on the three fields above (location will be automatic in our site later)
  $scope.search = function() {
    // Set to -1 to invoke a "change" when watching for active
    // This will reset to 0 when search returns successful results
    $scope.active = 1;
    // Hide header until new review/photo results are in
    $scope.showAdditionalInfo = false;

    console.log($scope.term);
    console.log($scope.location);
    console.log($scope.categories);

    return $http({
      method: 'POST',
      url: '/api/yelpSearch',
      data: {
        term: $scope.term,
        location: $scope.location,
        radius: 16000,
        categories: $scope.categories.alias,
        limit: 10,
        offset: 0,
        sort_by: 'best_match',
        price: '1,2,3,4'
      }
    }).then( res => {
      console.log('search results', res.data);
      $scope.results = res.data;
      $scope.active = 0;
    });
  };

  $scope.add = function() {
    var currentBusiness = $scope.results[$scope.active];
    var businessData = {
      yelpBusinessName: currentBusiness.name,
      yelpUrl: currentBusiness.url,
      yelpRating: currentBusiness.rating,
      yelpPriceRange: currentBusiness.price,
      yelpID: currentBusiness.id,
      yelpReviewCount: currentBusiness.review_count,
      yelpImage: currentBusiness.image_url,
      totalLikes: 0,
      description: 'no description',
      category: $scope.categories.alias
    };
    console.log('business data', businessData);
    // return $http({
    //   method: 'POST',
    //   url: '/api/activities',
    //   data: businessData
    // }).then( res => {

    // });
  };

  // Get more details on the specific business (for now, you click on the image)
  $scope.businessDetails = function(index) {
    return $http({
      method: 'POST',
      url: '/api/yelpBusiness',
      headers: {
        'x-auth': sessionStorage.getItem('auth')
      },
      data: {
        id: $scope.results[index].id
      }
    }).then( res => {
      // console.log('more details', res.data);
      $scope.reviews = res.data.reviews;
      $scope.morePhotos = res.data.details.photos;
      $scope.showAdditionalInfo = true;
    });
  };

  // Populate categories array with array of { "alias": ..., "title": ... } (1457 of them)
  $scope.seed = function() {
    return $http({
      method: 'GET',
      url: '../lib/categories.json'
    }).then( res => {
      $scope.allCategories = res.data.map( category => {
        return { alias: category.alias, title: category.title };
      });
      // console.log($scope.allCategories);
    }).catch( err => {
      console.error('error: ', err);
    });
  };

  $scope.seed();

  // Legacy variables (we still might need)
  $scope.userData = User.userData;
  $scope.newActivity = User.newActivity;
  $scope.currentTripIndex = User.currentTripIndex;
  $scope.deleteActivity = User.deleteActivity;
}]);
