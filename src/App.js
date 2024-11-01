import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import Data from './data/Electric_Vehicle_Population_Data.csv';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const App = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    make: '',
    type: '',
    year: '',
    city: ''
  });
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [activeView, setActiveView] = useState('charts'); // Control for the active view

  const onPage = (e) => {
    setFirst(e.first); // Set the index of the first item
    setRows(e.rows); // Set the number of rows per page
  };


  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(Data);
      const reader = response.body.getReader();
      const result = await reader.read();
      const decoder = new TextDecoder("utf-8");
      const csvData = decoder.decode(result.value);
      const parsedData = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true
      }).data;
      setData(parsedData);
      setFilteredData(parsedData);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = data.filter(item => {
      const matchesSearch = Object.values(item).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesFilters =
        (!filters.make || item.Make.toLowerCase().includes(filters.make.toLowerCase())) &&
        (!filters.type || item["Electric Vehicle Type"]?.toLowerCase().includes(filters.type.toLowerCase())) &&
        (!filters.year || item["Model Year"]?.toString() === filters.year) &&
        (!filters.city || item.City.toLowerCase().includes(filters.city.toLowerCase()));

      return matchesSearch && matchesFilters;
    });

    setFilteredData(filtered);
    setFirst(0);
  }, [searchTerm, filters, data]);

  const getVehicleTypeData = () => {
    const distribution = {};
    filteredData.forEach(item => {
      const type = item["Electric Vehicle Type"] || "Unknown";
      distribution[type] = (distribution[type] || 0) + 1;
    });

    return {
      labels: Object.keys(distribution),
      datasets: [{
        data: Object.values(distribution),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
      }]
    };
  };

  const getTopManufacturersData = () => {
    const manufacturers = {};
    filteredData.forEach(item => {
      manufacturers[item.Make] = (manufacturers[item.Make] || 0) + 1;
    });

    const sortedData = Object.entries(manufacturers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      labels: sortedData.map(([name]) => name),
      datasets: [{
        label: 'Number of Vehicles',
        data: sortedData.map(([, value]) => value),
        backgroundColor: '#36A2EB'
      }]
    };
  };

  const getYearlyTrendData = () => {
    const years = {};
    filteredData.forEach(item => {
      const year = item["Model Year"];
      if (year) {
        years[year] = (years[year] || 0) + 1;
      }
    });

    const sortedYears = Object.entries(years)
      .sort((a, b) => a[0] - b[0]);

    return {
      labels: sortedYears.map(([year]) => year),
      datasets: [{
        label: 'Number of Vehicles',
        data: sortedYears.map(([, count]) => count),
        borderColor: '#36A2EB',
        tension: 0.4,
        fill: false
      }]
    };
  };

  const getAnalytics = () => {
    const ranges = filteredData.map(item => parseInt(item.Range)).filter(r => !isNaN(r));
    return {
      averageRange: Math.round(ranges.reduce((a, b) => a + b, 0) / ranges.length),
      medianRange: ranges.sort((a, b) => a - b)[Math.floor(ranges.length / 2)],
      totalVehicles: filteredData.length,
      uniqueMakes: new Set(filteredData.map(item => item.Make)).size,
      uniqueModels: new Set(filteredData.map(item => item.Model)).size,
      uniqueCities: new Set(filteredData.map(item => item.City)).size
    };
  };

  // Chart Options
  const pieOptions = {
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  const barOptions = {
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  const lineOptions = {
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  const analytics = getAnalytics();

  return (
    <div className="container-fluid p-4">
      <div className="row my-4">
        <div className="col-12">
          <h1 className="fs-70 text-center">Electric Vehicle Dashboard</h1>

          <div className="row g-3 my-4">
            <div className="col-12 col-md">
              <InputText
                className="form-control"
                placeholder="Global Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {['make', 'type', 'year', 'city'].map((filterKey) => (
              <div key={filterKey} className="col-12 col-md">
                <InputText
                  className="form-control"
                  placeholder={`Filter by ${filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}`}
                  value={filters[filterKey]}
                  onChange={(e) => setFilters({ ...filters, [filterKey]: e.target.value })}
                />
              </div>
            ))}
          </div>

          <div className="row g-2 my-4 justify-content-center">
            {[
              { label: 'Total Vehicles', value: analytics.totalVehicles, icon: 'bi bi-car-front text-white' },
              { label: 'Avg Range', value: `${analytics.averageRange || 0} mi`, icon: 'bi bi-battery-charging text-success' },
              { label: 'Cities', value: analytics.uniqueCities || 0, icon: 'bi bi-geo-alt text-danger' },
              { label: 'Makes', value: analytics.uniqueMakes || 0, icon: 'bi bi-building text-info' },
              { label: 'Models', value: analytics.uniqueModels || 0, icon: 'bi bi-car-front-fill text-warning' },
              { label: 'Median Range', value: `${analytics.medianRange || 0} mi`, icon: 'bi bi-battery-full text-secondary' },
            ].map((stat, idx) => (
              <div key={idx} className="col-6 col-md-4 col-lg-2">
                <Card className="h-100 d-flex align-items-center justify-content-center">
                  <div className="d-flex align-items-center">
                    <i className={`${stat.icon} fs-2 me-3`}></i>
                    <div>
                      <p className="mb-0">{stat.label}</p>
                      <h3 className="mb-0">{stat.value}</h3>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          {/* Toggle buttons */}
          <div className="d-flex justify-content-center my-4 gap-4">
            <button
              className={`btn ${activeView === 'charts' && 'active'}`}
              onClick={() => setActiveView('charts')}
            >
              Charts
            </button>
            <button
              className={`btn ${activeView === 'table' && 'active'}`}
              onClick={() => setActiveView('table')}
            >
              Table View
            </button>
          </div>

          {/* Display based on active view */}
          {activeView === 'charts' && (

            <div className="container-fluid p-4">
              <div className="row g-4">
                {/* Pie Chart */}
                <div className="col-12 col-lg-6">
                  <Card className="card shadow">
                    <div className="">
                      <h5 className="card-title text-center m-0">
                        <i className="pi pi-chart-pie me-2"></i>
                        Vehicle Type Distribution
                      </h5>
                    </div>
                    <div className="card-body">
                      <div style={{ height: '300px' }}>
                        <Chart type="pie" style={{ height: 250 }} data={getVehicleTypeData()} options={pieOptions} />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Bar Chart */}
                <div className="col-12 col-lg-6">
                  <Card className="card shadow">
                    <div className="">
                      <h5 className="card-title text-center m-0">
                        <i className="pi pi-chart-bar me-2"></i>
                        Top Manufacturers
                      </h5>
                    </div>
                    <div className="card-body">
                      <div style={{ height: '300px' }}>
                        <Chart type="bar" style={{ height: 250 }} data={getTopManufacturersData()} options={barOptions} />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Line Chart - Full Width */}
                <div className="col-12">
                  <Card className="card shadow">
                    <div className="border-bottom-0">
                      <h5 className="card-title text-center m-0">
                        <i className="pi pi-chart-line me-2"></i>
                        Yearly Trend
                      </h5>
                    </div>
                    <div className="card-body">
                      <div style={{ height: '400px' }}>
                        <Chart type="line" style={{ height: 350 }} data={getYearlyTrendData()} options={lineOptions} />
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>

          )}

          {activeView === 'table' && (
        <DataTable
        value={filteredData}
        paginator
        rows={rows}
        first={first}
        onPage={onPage}
        className="p-datatable-striped custom-datatable"
        responsiveLayout="scroll"
        rowsPerPageOptions={[10, 25, 50, 100]}
        style={{ width: '100%', tableLayout: 'auto' }}
        header={`Total Records: ${filteredData.length}`} // Display total records in the header
      >
        <Column field="VIN (1-10)" header="VIN" sortable headerStyle={{ minWidth: '150px' }} />
        <Column field="Make" header="Make" sortable headerStyle={{ minWidth: '100px' }} />
        <Column field="Model" header="Model" sortable headerStyle={{ minWidth: '100px' }} />
        <Column field="Model Year" header="Year" sortable headerStyle={{ minWidth: '100px' }} />
        <Column field="Electric Vehicle Type" header="Type" sortable headerStyle={{ minWidth: '250px' }} />
        <Column field="Clean Alternative Fuel Vehicle (CAFV) Eligibility" header="CAFV Eligibility" sortable headerStyle={{ minWidth: '250px' }} />
        <Column field="Electric Range" header="Electric Range (miles)" sortable headerStyle={{ minWidth: '250px' }} />
        <Column field="Base MSRP" header="Base MSRP" sortable headerStyle={{ minWidth: '150px' }} />
        <Column field="County" header="County" sortable headerStyle={{ minWidth: '100px' }} />
        <Column field="City" header="City" sortable headerStyle={{ minWidth: '100px' }} />
        <Column field="Legislative District" header="Legislative District" sortable headerStyle={{ minWidth: '250px' }} />
        <Column field="DOL Vehicle ID" header="DOL Vehicle ID" sortable headerStyle={{ minWidth: '250px' }} />
        <Column field="Electric Utility" header="Electric Utility" sortable headerStyle={{ minWidth: '200px' }} />
      </DataTable>
      

          )}
        </div>
      </div>
    </div>
  );
};
export default App;