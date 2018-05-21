import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import CollaboratorListAdd from './CollaboratorListAdd';
import ConfirmDialog from '../../common/components/ConfirmDialog';
import '../css/CollaboratorList.scss';

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
      <div className="collaborator-container">
        <h2>Collaborators</h2>
        <CollaboratorListAdd
          {...this.props}
          collaborators={this.state.collaborators}
          deleteCollaborator={this.deleteCollaborator}
          collaboratorAddSuccess={this.collaboratorAddSuccess}
          message={this.state.message}
        />

        {this.state.collaborators.map(collaborator => (
          <p key={collaborator.email}>
            {collaborator.name}, {collaborator.email}, {collaborator.organization}
            {this.props.projectCreatorEmail !== collaborator.email && (
              <button
                className="user-delete-button"
                onClick={e => this.openDelDialog(e, collaborator.email, collaborator.name)}
              >
                <i className="material-icons">delete</i>
              </button>
            )}
          </p>
        ))}

        <ConfirmDialog
          titleText="Remove collaborator"
          contentText={`Are you sure you want to remove collaborator ${this.state.delName}`}
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
};

export default CollaboratorList;
