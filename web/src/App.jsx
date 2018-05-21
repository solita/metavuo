import React from 'react';
import { Route, Switch } from 'react-router-dom';
import axios from 'axios';
import Header from './common/components/Header';
import ProjectList from './ProjectList/components/ProjectList';
import Project from './Project/components/Project';
import CreateProject from './NewProject/components/CreateProject';
import AdminView from './AdminView/components/AdminView';
import NotFound from './common/components/NotFound';
import NoAccess from './common/components/NoAccess';
import AdminRoute from './common/util/AdminRoute';
import '../dist/fonts/fonts.css';
import './common/css/main.scss';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuth: false,
      isAdmin: false,
      userEmail: '',
    };
  }

  componentDidMount() {
    axios.get('/api/users/me')
      .then((res) => {
        if (res.status === 200) {
          const isAdmin = res.data.role === 'admin';
          this.setState({
            isAuth: true,
            userEmail: res.data.email,
            isAdmin,
          });
        }
      })
      .catch((err) => {
        this.setState({ isAuth: false });
        console.log(err);
      });
  }

  render() {
    return (
      <div>
        <Header
          userEmail={this.state.userEmail}
          isAdmin={this.state.isAdmin}
        />
        <div className="content-container">
          {this.state.isAuth
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
                <Route exact path="/" component={NoAccess} />
                <Route exact path="*" component={NotFound} />
              </Switch>
            )
          }
        </div>
      </div>
    );
  }
}

export default App;
