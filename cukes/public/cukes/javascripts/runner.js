(function($) {
  var CucumberHTMLListener = function($root) {
    var CucumberHTML = require('cucumber-html');
    var formatter    = new CucumberHTML.DOMFormatter($root);

    formatter.uri('report.feature');

    var currentStep;

    var self = {
      hear: function hear(event, callback) {
        var eventName = event.getName();
        switch (eventName) {
        case 'BeforeFeature':
          var feature = event.getPayloadItem('feature');
          formatter.feature({
            keyword     : feature.getKeyword(),
            name        : feature.getName(),
            line        : feature.getLine(),
            description : feature.getDescription()
          });
          break;

        case 'BeforeScenario':
          var scenario = event.getPayloadItem('scenario');
          formatter.scenario({
            keyword     : scenario.getKeyword(),
            name        : scenario.getName(),
            line        : scenario.getLine(),
            description : scenario.getDescription()
          });
          break;

        case 'BeforeStep':
          var step = event.getPayloadItem('step');
          self.handleAnyStep(step);
          break;

        case 'StepResult':
          var result;
          var stepResult = event.getPayloadItem('stepResult');
          if (stepResult.isSuccessful()) {
            result = {status: 'passed'};
          } else if (stepResult.isPending()) {
            result = {status: 'pending'};
          } else if (stepResult.isUndefined()) {
            result = {status: 'undefined'};
          } else if (stepResult.isSkipped()) {
            result = {status: 'skipped'};
          } else {
            var error = stepResult.getFailureException();
            var errorMessage = error.stack || error;
            result = {status: 'failed', error_message: errorMessage};
            displayError(error);
          }
          formatter.match({uri:'report.feature', step: {line: currentStep.getLine()}});
          formatter.result(result);
          break;

        case 'UndefinedStep':
        case 'SkippedStep':
          var step = event.getPayloadItem('step');
          self.handleAnyStep(step);
          formatter.match({uri:'report.feature', step: {line: step.getLine()}});
          formatter.result({status:'skipped'});
          break;
        }
        callback();
      },

      handleAnyStep: function handleAnyStep(step) {
        formatter.step({
          keyword     : step.getKeyword(),
          name        : step.getName(),
          line        : step.getLine(),
        });
        currentStep = step;
      }
    };
    return self;
  };

  function runFeature() {
    var Cucumber        = require('./cucumber');
    var supportCode;
    var output          = $('#output');
    var featureSource   = $('script[type="text/x-gherkin"]').first().html();
    var supportCode     = function () { window.supportCode.call(this); window.stepDefs.call(this); };
    var cucumber        = Cucumber(featureSource, supportCode);
    var $output         = $('#output');
    var listener        = CucumberHTMLListener($output);
    $output.empty();
    cucumber.attachListener(listener);

    resetErrors();
    try {
      var oldHandler = window.onerror;
      window.onerror = function(err) {
        displayError(err);
        window.onerror = oldHandler;
      };
      cucumber.start(function() { });
    } catch(err) {
      displayError(err)
      throw err;
    };
  };

  function resetErrors() {
    var errors          = $('#errors');
    var errorsContainer = $('#errors-container');
    errors.text('');
    errorsContainer.hide();
  };

  function displayError(err) {
    var errors          = $('#errors');
    var errorsContainer = $('#errors-container');

    errorsContainer.show();
    var errMessage = err.stack || err.message || err;
    var buffer = (errors.text() == '' ? errMessage : errors.text() + "\n\n" + errMessage);
    errors.text(buffer);
  };

  $(function() {
    Gherkin = { Lexer: function() { return Lexer; } };
    $('#run').click(runFeature);
    $('#errors-container').hide();
  });
})(jQuery);
