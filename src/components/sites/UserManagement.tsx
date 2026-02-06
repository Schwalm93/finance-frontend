import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
//import EditPopup from "./popups/EditPopup";

export type Users = {
  id: number;
  firstname: string;
  lastname: string;
  age: string;
  birthDate: Date;
  adress: string;
  housenumber: string;
  zipcode: string;
};

export const UserManagement: React.FC<{}> = () => {
  const [sortedusers, setSortedUsers] = useState<Users[]>([]);

  useEffect(() => {
    handleModel();
  }, []);

  const url = 'http://localhost:8080/usermanagement/users';

  const handleModel = () => {
    axios
      .get(url)
      .then((response) => {
        console.log(response);
        setSortedUsers(response.data);
      })
      .catch(function () {
        console.log('Error on loading User data!');
      });
  };

  // function edit(user: Users) {
  // //<EditPopup user={user} />
  //   return (
  //     <>
  //     </>
  //   )
  // }

  return (
    <>
      <Container
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginLeft: '80px',
          marginTop: '20px',
          width: '100%',
        }}
      >
        <div style={{ width: '90%', maxHeight: '650px', overflowY: 'auto' }}>
          <h3> User Data </h3>
          <Table striped bordered hover variant="white" className="rounded">
            <thead>
              <tr>
                <th>userId</th>
                <th>firstname</th>
                <th>lastname</th>
                <th>age</th>
                <th>birthdate</th>
                <th>adress</th>
                <th>housenumber</th>
                <th>zipcode</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortedusers.map((users: Users) => (
                <tr key={users.id} className="selected">
                  <td>{users.id}</td>
                  <td>{users.firstname}</td>
                  <td>{users.lastname}</td>
                  <td>{users.age}</td>
                  <td>{new Date(users.birthDate).toLocaleDateString()}</td>
                  <td>{users.adress}</td>
                  <td>{users.housenumber}</td>
                  <td>{users.zipcode}</td>
                  <td>
                    <Button variant="dark" size="sm">
                      
                    </Button>{' '}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Container>
    </>
  );
}
