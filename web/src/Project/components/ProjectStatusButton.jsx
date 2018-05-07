import React from 'react';
import { Button } from 'material-ui';
import axios from 'axios';
import PropTypes from 'prop-types';

class ProjectStatusButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonText: '',
      isEnabled: true,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.setButtonText(this.props.projectStatus);
  }

  setButtonText(id) {
    switch (id) {
      case 1:
        this.setState({ isEnabled: true, buttonText: 'Complete Project' });
        break;
      case 2:
        this.setState({ isEnabled: true, buttonText: 'Archive Project' });
        break;
      case 3:
        this.setState({ isEnabled: false, buttonText: 'Archived' });
        break;
      default:
        this.setState({ isEnabled: false, buttonText: 'Error' });
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    const data = new FormData();
    data.append('id', this.props.projectId);
    axios.post('/api/projects/status', data)
      .then((res) => {
        this.setButtonText(Number.parseInt(res.data, 10));
        this.props.setStatus(res.data);
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

ProjectStatusButton.propTypes = {
  projectId: PropTypes.string.isRequired,
  projectStatus: PropTypes.number.isRequired,
  setStatus: PropTypes.func.isRequired,
};

export default ProjectStatusButton;
