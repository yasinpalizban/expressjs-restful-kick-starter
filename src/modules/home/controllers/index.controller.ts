import {NextFunction, Request, Response} from 'express';
import { StatusCodes} from 'http-status-codes';
import {default as i18n} from "i18next";


export default class IndexController {
  public index = (req: Request, res: Response, next: NextFunction) => {
    try {

      res.status(StatusCodes.OK).json({
        'statusMessage': i18n.t('api.commons.receive'),
        'data': ' there is no data just empty  home page'
      });
    } catch (error) {
      next(error);
    }
  };
}

