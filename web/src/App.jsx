import React from 'react';
import { Route, Switch } from 'react-router-dom';
import axios from 'axios';
import Header from './Header/components/Header';
import ProjectList from './ProjectList/components/ProjectList';
import Project from './Project/components/Project';
import CreateProject from './NewProject/components/CreateProject';
import AdminView from './AdminView/components/AdminView';
import NotFound from './common/components/NotFound';
import NoAccess from './common/components/NoAccess';
import AdminRoute from './common/util/AdminRoute';
import './common/css/main.scss';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAdmin: false,
      isUser: false,
      userEmail: '',
    };
  }

  componentDidMount() {
    axios.get('/api/users/me')
      .then((res) => {
        if (res.status === 200) {
          this.setState({
            userEmail: res.data.email,
            isAdmin: res.data.roles.includes('admin'),
            isUser: res.data.roles.includes('user'),
          });
        }
      })
      .catch(() => {
        this.setState({ userEmail: '', isAdmin: false, isUser: false });
      });
  }

  renderRouter() {
    if (this.state.isAdmin || this.state.isUser) {
      return (
        this.state.isUser
          ? (
            <Switch>
              <Route exact path="/" component={ProjectList} />
              <Route path="/projects/new" component={CreateProject} />
              <Route exact path="/projects" component={ProjectList} />
              <Route path="/projects/:id" render={props => (<Project {...props} userEmail={this.state.userEmail} />)} />
              <AdminRoute exact path="/admin" component={AdminView} isAdmin={this.state.isAdmin} />
              <Route exact path="*" component={NotFound} />
            </Switch>
          )
          : (
            <Switch>
              <Route exact path="/" component={ProjectList} />
              <AdminRoute exact path="/admin" component={AdminView} isAdmin={this.state.isAdmin} />
              <Route exact path="*" component={NotFound} />
            </Switch>
          )
      );
    }

    return (
      <Switch>
        <Route exact path="/" component={NoAccess} />
        <Route exact path="*" component={NotFound} />
      </Switch>);
  }


  render() {
    const routerPart = this.renderRouter();
    return (
      <div>
        <Header
          userEmail={this.state.userEmail}
          isAdmin={this.state.isAdmin}
          isUser={this.state.isUser}
        />
        <div className="content-container">
          {routerPart}
        </div>
      </div>
    );
  }
}

export default App;
