var classNames = require("classnames");
var Link = require("react-router").Link;
var React = require("react/addons");

var DeploymentActions = require("../actions/DeploymentActions");
var DialogActions = require("../actions/DialogActions");
var DialogStore = require("../stores/DialogStore");

var DeploymentComponent = React.createClass({
  displayName: "DeploymentComponent",

  propTypes: {
    model: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    return {
      loading: false
    };
  },

  handleRevertDeployment: function () {
    var model = this.props.model;

    const dialogId = DialogActions.confirm(
      `Rollback deployment of applications: '${model.affectedAppsString}'?
      Destroying this deployment will create and start a new
      deployment to revert the affected app to its previous version.`,
        "Rollback deployment");

    DialogStore.handleUserResponse(dialogId, function () {
      this.setState({loading: true});
      DeploymentActions.revertDeployment(model.id);
    }.bind(this));
  },

  handleStopDeployment: function () {
    var model = this.props.model;

    const dialogId = DialogActions.confirm(
      `Stop deployment of applications: '${model.affectedAppsString}'?
      This will stop the deployment immediately and leave it in the
      current state.`,
        "Stop deployment");

    DialogStore.handleUserResponse(dialogId, function () {
      this.setState({loading: true});
      DeploymentActions.stopDeployment(model.id);
    }.bind(this));
  },

  getButtons: function () {
    if (this.state.loading) {
      return (<div className="loading-bar" />);
    } else {
      return (
        <ul className="list-inline">
          <li>
            <button
                onClick={this.handleStopDeployment}
                className="btn btn-xs btn-default">
              Stop
            </button>
          </li>
          <li>
            <button
                onClick={this.handleRevertDeployment}
                className="btn btn-xs btn-default">
              Rollback
            </button>
          </li>
        </ul>
      );
    }
  },

  render: function () {
    var model = this.props.model;

    var isDeployingClassSet = classNames({
      "text-warning": model.currentStep < model.totalSteps
    });

    var progressStep = Math.max(0, model.currentStep - 1);

    return (
      // Set `title` on cells that potentially overflow so hovering on the
      // cells will reveal their full contents.
      <tr>
        <td className="overflow-ellipsis" title={model.id}>
          {model.id}
        </td>
        <td>
          <ul className="list-unstyled">
            {model.currentActions.map(function (action) {
              let appId = encodeURIComponent(action.app);
              return (
                <li key={action.app} className="overflow-ellipsis">
                  <Link to="app" params={{appId: appId}}>{action.app}</Link>
                </li>
              );
            })}
          </ul>
        </td>
        <td>
          <ul className="list-unstyled">
            {model.currentActions.map(function (action) {
              return <li key={action.app}>{action.action}</li>;
            })}
          </ul>
        </td>
        <td className="text-right">
          <span className={isDeployingClassSet}>
            {progressStep}
          </span> / {model.totalSteps}
        </td>
        <td className="text-right deployment-buttons">
          {this.getButtons()}
        </td>
      </tr>
    );
  }
});

module.exports = DeploymentComponent;
