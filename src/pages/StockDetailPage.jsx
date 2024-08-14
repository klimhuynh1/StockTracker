import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import financialModelingPrep, { TOKEN } from "../apis/financialModelingPrep";
import { StockChart } from "../components/StockChart";

const formatData = (data) => {
  return data.map((el) => {
    return {
      x: el.date,
      y: el.close,
    };
  });
};

// TODO: Test this
const filterData = (data, range) => {
  
  // Convert datetime strings to Date objects
  const dateObjects = data.map((el) => new Date(el));

  // Find the newest datetime
  const newestDate = new Date(Math.max(...dateObjects));

  // Define time range in milliseconds
  let timeRange;
  switch (range) {
    case "day":
      timeRange = 24 * 60 * 60 * 1000;
      break;
    case "week":
      timeRange = 7 * 24 * 60 * 60 * 1000;
      break;
    case "year":
      timeRange = 365 * 24 * 60 * 60 * 1000;
      break;
  }

  const filteredDates = dateObjects.filter((date) => {
    const timeDifference = newestDate - date;
    return timeDifference <= timeRange;
  });

  // Convert filtered Date objects back to strings
  const filteredDateStrings = dateObjects.map((date) => {
    date.toISOString();
  });

  console.log(filteredDateStrings);
};

export const StockDetailPage = () => {
  const [chartData, setChartData] = useState([]);
  const { symbol } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const nowDate = new Date();
        const weekBehindDate = new Date(nowDate);
        weekBehindDate.setDate(nowDate.getDate() - 7);

        // Format 'toDate' for the API request
        const toDate =
          weekBehindDate.getFullYear() +
          "-" +
          ("0" + (weekBehindDate.getMonth() + 1)).slice(-2) +
          "-" +
          ("0" + weekBehindDate.getDate()).slice(-2);

        // Calculate and format 'oneDay'
        let oneDay = new Date(weekBehindDate);
        if (nowDate.getDay() === 6) {
          // Saturday
          oneDay.setDate(weekBehindDate.getDate() - 2);
        } else if (nowDate.getDay() === 0) {
          // Sunday
          oneDay.setDate(weekBehindDate.getDate() - 3);
        } else {
          oneDay.setDate(weekBehindDate.getDate() - 1);
        }

        const oneDayString =
          oneDay.getFullYear() +
          "-" +
          ("0" + (oneDay.getMonth() + 1)).slice(-2) +
          "-" +
          ("0" + oneDay.getDate()).slice(-2);

        // Calculate and format 'oneWeekString'
        const oneWeekDate = new Date(weekBehindDate);
        oneWeekDate.setDate(weekBehindDate.getDate() - 7);
        const oneWeekString =
          oneWeekDate.getFullYear() +
          "-" +
          ("0" + (oneWeekDate.getMonth() + 1)).slice(-2) +
          "-" +
          ("0" + oneWeekDate.getDate()).slice(-2);

        // Calculate and format 'oneYearString'
        const oneYearDate = new Date(weekBehindDate);
        oneYearDate.setFullYear(weekBehindDate.getFullYear() - 1);
        const oneYearString =
          oneYearDate.getFullYear() +
          "-" +
          ("0" + (oneYearDate.getMonth() + 1)).slice(-2) +
          "-" +
          ("0" + oneYearDate.getDate()).slice(-2);

        // Make API requests
        const responses = await Promise.all([
          financialModelingPrep.get(
            `/historical-chart/30min/${symbol}?from=${oneDayString}&to=${toDate}&apikey=${TOKEN}`,
          ),
          financialModelingPrep.get(
            `/historical-chart/1hour/${symbol}?from=${oneWeekString}&to=${toDate}&apikey=${TOKEN}`,
          ),
          financialModelingPrep.get(
            `/historical-chart/4hour/${symbol}?from=${oneYearString}&to=${toDate}&apikey=${TOKEN}`,
          ),
        ]);

        // filterData(responses[0].data);
        setChartData({
          day: formatData(responses[0].data),
          week: formatData(responses[1].data),
          year: formatData(responses[2].data),
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [symbol]);

  return (
    <div>
      {chartData && (
        <div>
          <StockChart chartData={chartData} symbol={symbol} />
        </div>
      )}
    </div>
  );
};
