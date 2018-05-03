import React from 'react';
import { Button } from 'material-ui';
import axios from 'axios';

class ProjectStatusButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonText: '',
      projectStatus: props.projectStatus,
      id: props.id,
      isEnabled: props.projectStatus.text !== 'Archived',
      handler: props.handler,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.setButtonText(Number.parseInt(props.projectStatus, 10));
  }

  setButtonText(id) {
    switch (id) {
      case 1:
        this.state.buttonText = 'Complete Project';
        break;
      case 2:
        this.state.buttonText = 'Archive Project';
        break;
      case 3:
        this.state.isEnabled = false;
        this.state.buttonText = 'Archived';
        break;
      default:
        this.state.isEnabled = false;
        this.state.buttonText = 'Error';
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    axios.post(
      '/api/projects/status',
      JSON.stringify({ id: this.state.id }),
    ).then((res) => {
      this.setButtonText(Number.parseInt(res.data, 10));
      this.setState({ projectStatus: res.data });
      this.state.handler(this.state.projectStatus);
    });
  }
  render() {
    return (
      <Button
        onClick={this.handleSubmit}
        type="submit"
        id="submit-status"
        variant="raised"
        color="primary"
        disabled={!this.state.isEnabled}
        style={{ margin: 12 }}
      >
        {this.state.buttonText}
      </Button>
    );
  }
}

export default ProjectStatusButton;
