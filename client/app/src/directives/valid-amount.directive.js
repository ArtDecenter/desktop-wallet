;(function () {
  'use strict'

  angular.module('arkclient.directives')
    .directive('validAmount', ['utilityService',
      function (utilityService) {
        return {
          require: 'ngModel',
          link: function (scope, elem, attrs, ctrl) {
            const val = function (value) {
              if (typeof value === 'undefined' || value === 0) {
                ctrl.$pristine = true
              }
              const num = Number(utilityService.arkToArktoshi(value, 0)) // 1.1 = 110000000

              // TODO test
              let totalBalance = scope.send ? scope.send.totalBalance : scope.totalBalance
              totalBalance = Number(utilityService.arkToArktoshi(totalBalance))

              // TODO test
              let remainingBalance = utilityService.arktoshiToArk(totalBalance - num, true)
              remainingBalance = isNaN(remainingBalance) ? utilityService.arktoshiToArk(totalBalance, true) : remainingBalance
              if (scope.send) {
                scope.send.remainingBalance = remainingBalance
              } else {
                scope.remainingBalance = remainingBalance
              }

              if (typeof num === 'number' && num > 0) {
                if (num > Number.MAX_SAFE_INTEGER) {
                  ctrl.$setValidity('validAmount', false)
                } else {
                  ctrl.$setValidity('validAmount', true)
                }
              } else {
                ctrl.$setValidity('validAmount', false)
              }
              return value
            }
            ctrl.$parsers.unshift(val)
            ctrl.$formatters.unshift(val)
          }
        }
      }
    ])
})()
