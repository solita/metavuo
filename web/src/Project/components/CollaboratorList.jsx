import React from 'react';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import PropTypes from 'prop-types';
import CollaboratorListAdd from './CollaboratorListAdd';
import ConfirmDialog from '../../common/components/ConfirmDialog';

class CollaboratorList extends React.Component {
  constructor(props) {
    super(props);
    this.state = ({
      collaborators: [],
      message: '',
      delDialogOpen: false,
      delName: '',
      delEmail: '',
    });
    this.collaboratorAddSuccess = this.collaboratorAddSuccess.bind(this);
    this.openDelDialog = this.openDelDialog.bind(this);
    this.closeDelDialog = this.closeDelDialog.bind(this);
    this.deleteCollaborator = this.deleteCollaborator.bind(this);
  }

  componentDidMount() {
    this.updateCollaborators();
  }

  updateCollaborators() {
    axios.get(`/api/projects/${this.props.projectId}/collaborators`)
      .then((res) => {
        if (res.status === 200 && res.data !== null) {
          this.setState({ collaborators: res.data });
        } else if (res.status === 204) {
          this.setState({ collaborators: [] });
        } else {
          this.setState({ message: 'Could not get collaborators' });
        }
      })
      .catch(() => {
        this.setState({ message: 'Could not get collaborators' });
      });
  }

  collaboratorAddSuccess() {
    setTimeout(() => {
      this.updateCollaborators();
    }, 500);
  }

  openDelDialog(event, email, name) {
    event.preventDefault();
    this.setState({ delDialogOpen: true, delEmail: email, delName: name });
  }

  closeDelDialog() {
    this.setState({ delDialogOpen: false, delEmail: '', delName: '' });
  }

  deleteCollaborator() {
    this.setState({ delDialogOpen: false });
    axios.put(
      `/api/projects/${this.props.projectId}/collaborators`,
      JSON.stringify({ email: this.state.delEmail }),
    )
      .then(() => {
        if (this.state.delEmail === this.props.userEmail) {
          this.props.history.push('/projects');
        }
        this.setState({ delEmail: '', delName: '' });
        this.updateCollaborators();
      })
      .catch((err) => {
        if (err.response.status === 400) {
          this.setState({ message: err.response.data });
        }
        this.setState({ delEmail: '', delName: '' });
      });
  }

  render() {
    return (
      <div>
        <h2>Collaborators</h2>
        <div className="secondary-card-body">
          {this.state.collaborators.map(collaborator => (
            <div key={collaborator.email} className="secondary-card-items">
              <div>
                <p className="bold-text">{collaborator.name}</p>
                <p className="light-text">{collaborator.email}</p>
                <p className="light-text">{collaborator.organization}</p>
              </div>
              {this.props.projectCreatorEmail !== collaborator.email && (
                <Tooltip title="Delete" placement="bottom">
                  <Button
                    variant="fab"
                    className="gray-button round-button"
                    onClick={e => this.openDelDialog(e, collaborator.email, collaborator.name)}
                  >
                    <i className="material-icons">delete_outline</i>
                  </Button>
                </Tooltip>
              )}
            </div>
          ))}
        </div>

        <CollaboratorListAdd
          {...this.props}
          collaborators={this.state.collaborators}
          deleteCollaborator={this.deleteCollaborator}
          collaboratorAddSuccess={this.collaboratorAddSuccess}
          message={this.state.message}
        />

        <ConfirmDialog
          titleText="Remove collaborator"
          contentText={`Are you sure you want to remove collaborator ${this.state.delName}?`}
          actionButtonText="Remove"
          dialogOpen={this.state.delDialogOpen}
          closeDialog={this.closeDelDialog}
          action={this.deleteCollaborator}
        />
      </div>
    );
  }
}

CollaboratorList.propTypes = {
  projectId: PropTypes.string.isRequired,
  projectCreatorEmail: PropTypes.string.isRequired,
  userEmail: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(CollaboratorList);
