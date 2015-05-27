/**
 * @class MEPH.util.DataModel
 * String
 */
MEPH.define('MEPH.util.DataModel', {
    requires: ['MEPH.util.Validatable'],
    statics: {
        /**
         * Adds validation rules to a model.
         **/
        model: function (model, rules) {
            if (Array.isArray(model)) {
                model.foreach(function (x) {
                    MEPH.util.DataModel.model(x, rules);
                })
            }
            else {
                var Validatable = MEPH.util.Validatable;
                if (!Validatable.isValidatable(model)) {
                    Validatable.validatable(model);
                }

                if (!Array.isArray(rules)) {
                    rules = [rules];
                }

                rules = rules.where(function (x) {
                    return !Validatable.getRulesOnPath(model, x.path).some(function (y) {
                        return y.test === x.rule;
                    });;
                });

                rules.foreach(function (ruleConfig) {
                    Validatable.addValidationRule(model, ruleConfig.path, ruleConfig.rule);
                });
            }
            return model;
        }
    }
});