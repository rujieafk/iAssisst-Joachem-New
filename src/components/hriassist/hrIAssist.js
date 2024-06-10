import React, {useState} from 'react';
import '../../App.css';
import * as XLSX from 'xlsx';
import Navbar from '../navbar';
import TopNavbar from '../topnavbar'; 
import Footer from '../footer';
// import { useNavigate } from "react-router-dom";
import { variables } from '../../variables'; 
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const HRIAssist = () => {

  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [submissions, setSubmissions] = useState([]);
 
  const viewRequest = (data) => {
    navigate('/request', { state: { data } }) 
  };


  
  useEffect(() => {
    handleFormSubmit()
  }, []);
  
  const handleFormSubmit = async () => {
    
    const EmpId = '10023'

    const formData = new FormData();
    formData.append('EmpId', EmpId); 
     
    try {
      const uploadResponse = await fetch('http://localhost:5000/hrsubmission', {
        method: 'POST',
      }) 
  
      if (!uploadResponse.ok) {
        console.error('Failed:', uploadResponse.statusText);
        return;
      } 

      try {
        const data = await uploadResponse.json(); // Wait for the JSON data to be parsed
        // console.log(data.result);
        setSubmissions(data.result) 
      } catch (error) {
          console.error('Error parsing JSON response:', error);
      }

      // console.log('PDF uploaded successfully');
    } catch (error) {
      console.error('Error:', error);
    }
  };
   
  // console.log(submissions);

  return (
    
          <div>
      <div id="wrapper">
         {/* Sidebar */}
         <Navbar />
            {/* Content Wrapper */}
      <div id="content-wrapper" className="d-flex flex-column">
        {/* Main Content */}
        <div id="content">
         {/* Topbar */}
         <TopNavbar />
            {/* Start of Page Content */}
            <div className="container-fluid">
              <div className="row justify-content-center">
                <div className="col-xl-12 col-lg-12">
                  <div className="card shadow mb-4">
                    <div className="card-body">
                      <div className="tab-content"> 
                        <div
                                  className={`tab-pane fade show active `}
                                  id="newHireReports"
                                  role="tabpanel"
                                  aria-labelledby="reports-tab"
                                > 
                          <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>
                                                Name
                                            </th> 
                                            <th>
                                                Transaction Type
                                            </th> 
                                            <th>
                                                Turn-Around time
                                            </th> 
                                            <th>
                                                Status
                                            </th> 
                                            <th>
                                                Date Sent
                                            </th> 
                                            <th>
                                                Action/s
                                            </th>  
                                        </tr>
                                    </thead>
                                    <tbody>
                                      {submissions.map((sub, index) =>
                                        <tr key={index}>
                                            <td className='column'>
                                                  <label>{sub.Name}</label>
                                            </td>  
                                            <td className='column'>
                                                  <label>{sub.TransactionType}</label> 
                                            </td>  
                                            <td className='column'>
                                                  <label>{sub.TurnAround} Days</label> 
                                            </td>  
                                            <td className='column'>
                                                  <label>{sub.Status}</label> 
                                            </td>  
                                            <td className='column'>
                                              <label>{sub.DateTime}</label> 
                                            </td> 
                                            {/* <button onClick={() => handleButtonClick(sub)}>Go to Next Page</button>  */}
                                            <td className='column'>
                                              <button type="button" 
                                              className="btn btn-primary m-2 float-end"
                                              onClick={() => viewRequest(sub)}>
                                                  View
                                              </button>
                                            </td>  
                                        </tr> 
                                      )}
                                    </tbody>
                                </table>
                            <br />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* /.container-fluid */}
          </div>
          {/* Footer */}
          <Footer />
          {/* End of Page Content */}
        </div>
        {/* End of Content Wrapper */}
      </div>
      {/* End of Page Wrapper */}
      </div>
  );
}

export default HRIAssist;
