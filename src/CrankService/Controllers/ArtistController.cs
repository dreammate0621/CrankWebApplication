using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Crankdata.Models;
using MongoDB.Driver;
using Microsoft.AspNetCore.Mvc;
using CrankService.Models;
using MongoDB.Bson;

namespace CrankService.Controllers
{
    public class ArtistController: Controller
    {
        CrankdataContext _artistContext = new CrankdataContext();
        IMongoCollection<Artist> _artists = null;
        public ArtistController()
        {
            _artists = _artistContext.Artists;
        }


        [HttpGet()]
        [Route("/api/v1/artists")]
        public async Task<IActionResult> Get()
        {
            try
            {
                var cursor = await _artists.FindAsync<Artist>(new BsonDocument());
                return Ok(cursor.ToList());
            }
            catch (Exception e)
            {
                Console.WriteLine("{0} Exception caught.", e);
                return NoContent();
            }

        }

        [HttpPost()]
        [Route("/api/v1/artists/search")]
        public async Task<IActionResult> Post([FromBody] ArtistFilter filter)
        {
            try
            {
                var cursor = await _artists.FindAsync<Artist>(filter.ToFilterDefinition());
                return Ok(cursor.ToList());
            }
            catch (Exception e)
            {
                Console.WriteLine("{0} Exception caught.", e);
                return NotFound();
            }
        }

        [HttpGet()]
        [Route("/api/v1/artists/{artist_id}")]
        public async Task<IActionResult> Get(Guid artist_id)
        {
            try
            {
                ArtistFilter filter = new ArtistFilter();
                filter.Mbid = artist_id;

                var cursor = await _artists.FindAsync<Artist>(filter.ToFilterDefinition());
                return Ok(cursor.ToList());
            }
            catch (Exception e)
            {
                Console.WriteLine("{0} Exception caught.", e);
                return NotFound();
            }
        }

    }
}
