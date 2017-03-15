using GeoService.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GeoService.Controllers
{
    public class GeoController : Controller
    {
        GeoContext _geoContext = new GeoContext();
        IMongoCollection<Country> _countries = null;
        public GeoController()
        {
            _countries = _geoContext.Countries;
        }


        [HttpGet()]
        [Route("/api/v1/geo/countries")]
        public async Task<IActionResult> Get()
        {
            try
            {
                var cursor = await _countries.FindAsync<Country>(new BsonDocument());
                return Ok(cursor.ToList());
            }
            catch(Exception e)
            {
                Console.WriteLine("{0} Exception caught.", e);
                return NoContent();
            }
            
        }

        [HttpPost()]
        [Route("/api/v1/geo/countries/search")]
        public async Task<IActionResult> Post([FromBody] CountryFilter filter)
        {
            try
            {
                var cursor = await _countries.FindAsync<Country>(filter.ToFilterDefinition());
                return Ok(cursor.ToList());
            } catch(Exception e)
            {
                Console.WriteLine("{0} Exception caught.", e);
                return NotFound();
            }
        }

        [HttpGet()]
        [Route("/api/v1/geo/countries/{id}")]
        public async Task<IActionResult> Get(string id)
        {
            try
            {
                CountryFilter filter = new CountryFilter();
                filter.id = id;

                var cursor = await _countries.FindAsync<Country>(filter.ToFilterDefinition());
                return Ok(cursor.ToList());
            } catch( Exception e)
            {
                Console.WriteLine("{0} Exception caught.", e);
                return NotFound();
            }
        }
    }
}
