import React, { useState } from 'react';
import Loader from '../elements/Loader';
import { hostname } from '../../utils/global';

const ExportField = (props) => {
    const [filename, setFilename] = useState("default");
    const [isLoading, setIsLoading] = useState(false);


    const changeFilename = (e) => {
        // e.preventDefault();
        if (filename === null || filename === "") {
            setFilename("default");
        } else {
            setFilename(e.target.value);
        }
    }


    const exportHandler = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            // http://localhost:4000/api/event/assign-initial-net/611c978ef047ea50e9798039
            const requestOptions = {
                method: 'POST',
                headers: { "Content-Type": 'application/json',  "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ filename })
            };

            const response = await fetch(`${hostname}/api/performance/exports/${props.eventID}`, requestOptions);
            const blob = await response.blob();
            // Create blob link to download
            const url = window.URL.createObjectURL(
                new Blob([blob]),
            );
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute(
                'download',
                `${filename}.xlsx`,
            );

            // Append to html link element page
            document.body.appendChild(link);

            // Start download
            link.click();

            // Clean up and remove the link
            link.parentNode.removeChild(link);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="ExportField">
            {isLoading ? <Loader />: (<React.Fragment>
                <h2 className="h2">Export result of this event as MS excel.</h2>
                <div className="mb-3">
                    <label htmlFor="file-name" className="form-label">File name</label>
                    <input type="text" className="form-control" id="file-name" onChange={changeFilename} />
                </div>
                <div className="mb-3">
                    <button className="btn btn-primary" onClick={exportHandler}>Export</button>
                </div>
            </React.Fragment>
            )}
        </div>
    )
}

export default ExportField;
