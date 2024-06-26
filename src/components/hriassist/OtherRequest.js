import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../navbar';
import TopNavbar from '../topnavbar';
import Footer from '../footer';
import '../../App.css';
import { variables } from '../../variables';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function OtherRequest() {

    const EmployeeId = sessionStorage.getItem("employeeId");

    const [thisInfo, setThisInfo] = useState({
        RequestTitle: "",
        Description: "",
        NeccesaryFile: ""
    });

    useEffect(() => {
        [EmployeeId]
    });

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        const isValidFileType = (file) => {
            const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
            return allowedTypes.includes(file.type);
        };
        
        // Proceed with the file upload
        const formData = new FormData();
        formData.append('currentEmployeeId', EmployeeId);

        if (!thisInfo.RequestTitle) {
            toast.error('Request title is required.', {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
            return; // Stop further execution
        }
        
        if (!thisInfo.Description) {
            toast.error('Description is required.', {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
            return; // Stop further execution
        }
        
        if (thisInfo.NeccesaryFile && isValidFileType(thisInfo.NeccesaryFile)) {
            formData.append('RequestTitle', thisInfo.RequestTitle);
            formData.append('Description', thisInfo.Description);
            formData.append('NeccesaryFile', thisInfo.NeccesaryFile);
        } else {
            toast.error('Invalid file type for necessary file. Please upload a valid file.', {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
            return; // Stop further execution
        }
        
        
        try {
            const response = await fetch('/OtherRequest', {
                method: 'POST',
                body: formData,
            });
    
            if (response.ok) {
                const jsonResponse = await response.json();
                console.log(jsonResponse.message);
    
                setThisInfo({
                    RequestTitle: '',
                    Description: '',
                    NeccesaryFile: ''
                });
    
                // Clear file input fields
                document.getElementById('RequestTitle').value = null;
                document.getElementById('Description').value = null;
                document.getElementById('NeccesaryFile').value = null;
    
                // Emit success toast
                toast.success('Thank you! Your request has been submitted.', {
                    position: "bottom-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
    
            } else {
                console.error('Failed to submit request:', response.statusText);
                toast.error('Failed to Submit', {
                    position: "bottom-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
            }
        } catch (error) {
            console.error('Error uploading:', error);
        }
    }
    
    const handleRequestTitle = (e) => {
        setThisInfo({ ...thisInfo, RequestTitle: e.target.value });
    };

    const handleDescription = (e) => {
        setThisInfo({ ...thisInfo, Description: e.target.value });
    };
    const handleNeccesaryFile = (e) => {
        setThisInfo({ ...thisInfo, NeccesaryFile: e.target.files[0] });
      };

    return (
        <div id="wrapper">
            <Navbar />
            <div id="content-wrapper" className="d-flex flex-column">
                <div id="content">
                    <TopNavbar />
                    <div className="container-fluid">
                        <div className="row justify-content-center">
                            <h4 className="m-0 font-weight-bold text-primary header-name">Other Request</h4>
                        </div>
                    </div>
                    <form onSubmit={handleFormSubmit}>
                        {/* page content begin here */}
                        <div className="container-fluid">
                            <div className="row justify-content-center">
                                <div className="col-xl-8 col-lg-7">
                                    <div className="card shadow mb-4">
                                        {/* Card Header - New Hire Upload */}
                                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                            <h6 className="m-0 font-weight-bold text-primary">Request Document</h6>
                                        </div>
                                        {/* Card Body - New Hire Options */}
                                        <div className="card-body">
                                            <div className="tab-content">
                                                <div className="card-body">
                                                    <div className="form-group ">
                                                        <label> Request Type:</label>
                                                        <input
                                                            type="text"
                                                            className="form-control text-gray-700"
                                                            id="RequestTitle"
                                                            name="RequestTitle"
                                                            value={thisInfo.RequestTitle}
                                                            onChange={handleRequestTitle}
                                                            placeholder="Type here..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Page content ends here */}

                        {/* page content begin here */}
                        <div className="container-fluid">
                            <div className="row justify-content-center">
                                <div className="col-xl-8 col-lg-7">
                                    <div className="card shadow mb-4">
                                        {/* Card Header - New Hire Upload */}
                                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                            <h6 className="m-0 font-weight-bold text-primary">Description</h6>
                                        </div>
                                        {/* Card Body - New Hire Options */}
                                        <div className="card-body">
                                            <div className="tab-content">
                                                <div className="card-body">
                                                    <div className="form-group">
                                                        <textarea
                                                            className="form-control text-gray-700"
                                                            style={{ height: '200px' }} // This line sets the height to 100px
                                                            id="Description"
                                                            name="Description"
                                                            value={thisInfo.Description}
                                                            onChange={handleDescription}
                                                            placeholder="Type here..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Page content ends here */}
                        
                        {/* page content begin here */}
                        <div className="container-fluid">
                            <div className="row justify-content-center">
                                <div className="col-xl-8 col-lg-7">
                                    <div className="card shadow mb-4">
                                        {/* Card Header - New Hire Upload */}
                                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                            <h6 className="m-0 font-weight-bold text-primary">Upload file</h6>
                                        </div>
                                        {/* Card Body - New Hire Options */}
                                        <div className="card-body">
                                            <div className="tab-content">
                                                <div className="card-body">
                                                    <div className="form-group">
                                                            <label style={{ fontSize: '14px' }}>( Upload a file if neccesary )</label>
                                                            <input 
                                                                id="NeccesaryFile" 
                                                                type="file" 
                                                                className="form-control-file" 
                                                                aria-describedby="fileHelp" 
                                                                onChange={handleNeccesaryFile} 
                                                            />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Page content ends here */}
                       
                        <button type="submit" className="btn btn-primary d-block mx-auto loan-btn">Submit</button>
                    </form>
                </div>
                <Footer />
            </div>
            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    );
}

export default OtherRequest;
